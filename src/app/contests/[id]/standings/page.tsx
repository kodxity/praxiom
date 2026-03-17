import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { StandingsClient } from './StandingsClient';
import React from 'react';

export default async function StandingsPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;

    const contest = await prisma.contest.findUnique({
        where: { id: params.id },
        include: {
            problems: { orderBy: { id: 'asc' } },
            submissions: { 
                include: { user: { select: { id: true, username: true, displayName: true, rating: true } } },
                orderBy: { createdAt: 'asc' } 
            },
            registrations: { include: { user: { select: { id: true, username: true, displayName: true, rating: true } } } },
            ratingHistory: true,
            teams: {
                include: {
                    members: {
                        include: { user: { select: { id: true, username: true, displayName: true } } },
                    },
                },
            },
        }
    });

    if (!contest) notFound();

    const session = await getServerSession(authOptions);
    let viewerReg = null;
    if (session?.user?.id) {
        viewerReg = await prisma.registration.findFirst({
            where: { userId: session.user.id, contestId: params.id, isVirtual: true, startTime: { not: null } },
            orderBy: { createdAt: 'desc' }
        });
        
        if (viewerReg?.startTime) {
            const end = new Date(viewerReg.startTime.getTime() + (contest.duration ?? 0) * 60000);
            if (new Date() > end) viewerReg = null;
        } else {
            viewerReg = null;
        }
    }

    const isTeamContest = (contest as any).contestType === 'team' || (contest as any).contestType === 'relay';

    // Rating delta map (userId -> change)
    const ratingDeltaMap = new Map<string, number>();
    (contest as any).ratingHistory?.forEach((h: any) => ratingDeltaMap.set(h.userId, h.change));

    const contestDurationMins = contest.duration ?? Math.floor((contest.endTime.getTime() - contest.startTime.getTime()) / 60000);

    const entityStartTimes = new Map<string, Date>();
    if (isTeamContest) {
        (contest as any).teams.forEach((t: any) => { if (t.startTime) entityStartTimes.set(t.id, t.startTime); });
    } else {
        (contest as any).registrations.forEach((r: any) => { if (r.startTime) entityStartTimes.set(r.id, r.startTime); });
    }

    // Capture all submissions.
    const subs = (contest as any).submissions;

    // Build per-problem stats
    type ProblemStat = { solved: boolean; solveTime: Date | null; waPenalty: number };
    const buildEntityStats = (entitySubs: any[]): Record<string, ProblemStat> => {
        const problems: Record<string, ProblemStat> = {};
        const sorted = [...entitySubs].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        for (const sub of sorted) {
            const pid = sub.problemId;
            if (!problems[pid]) problems[pid] = { solved: false, solveTime: null, waPenalty: 0 };
            const ps = problems[pid];
            if (ps.solved) continue;
            if (sub.isCorrect) {
                ps.solved = true;
                ps.solveTime = sub.createdAt;
            } else {
                ps.waPenalty += 5;
            }
        }
        return problems;
    };

    const problemPointsMap = new Map<string, number>(
        (contest as any).problems.map((p: any) => [p.id, p.points] as [string, number])
    );

    const elapsedMins = (date: Date, entityKey: string) => {
        const start = entityStartTimes.get(entityKey) ?? contest.startTime;
        return Math.max(0, Math.min(Math.floor((date.getTime() - start.getTime()) / 60000), contestDurationMins));
    };

    const computeScore = (problems: Record<string, ProblemStat>, entityKey: string) => {
        let solvedCount = 0;
        let totalTime = 0;
        let totalScore = 0;
        for (const [pid, ps] of Object.entries(problems)) {
            if (!ps.solved) continue;
            solvedCount++;
            totalTime += elapsedMins(ps.solveTime!, entityKey) + ps.waPenalty;
            totalScore += problemPointsMap.get(pid) ?? 0;
        }
        return { solvedCount, totalTime, totalScore };
    };

    // Grouping
    const stands: any[] = [];
    const firstSolveMap = new Map<string, string>();

    if (isTeamContest) {
        const subsByTeam = new Map<string, any[]>();
        subs.forEach((s: any) => {
            if (s.isUpsolve || !s.teamId) return;
            if (!subsByTeam.has(s.teamId)) subsByTeam.set(s.teamId, []);
            subsByTeam.get(s.teamId)!.push(s);
        });
        (contest as any).teams.forEach((team: any) => {
            const teamSubs = subsByTeam.get(team.id) ?? [];
            const problems = buildEntityStats(teamSubs);
            const { solvedCount, totalTime, totalScore } = computeScore(problems, team.id);
            stands.push({ key: team.id, name: team.name, user: { username: team.name }, members: team.members, problems, solvedCount, totalTime, totalScore, isVirtual: false, registrationId: null, startTime: team.startTime?.toISOString() });
        });
    } else {
        const subsByReg = new Map<string, any[]>();
        subs.forEach((s: any) => {
            if (s.isUpsolve || !s.registrationId) return;
            if (!subsByReg.has(s.registrationId)) subsByReg.set(s.registrationId, []);
            subsByReg.get(s.registrationId)!.push(s);
        });
        (contest as any).registrations.forEach((reg: any) => {
            const regSubs = subsByReg.get(reg.id) ?? [];
            const problems = buildEntityStats(regSubs);
            const { solvedCount, totalTime, totalScore } = computeScore(problems, reg.id);
            stands.push({ 
                key: reg.id, 
                userId: reg.userId,
                user: reg.user, 
                problems, 
                solvedCount, 
                totalTime, 
                totalScore, 
                isVirtual: reg.isVirtual, 
                registrationId: reg.id,
                startTime: reg.startTime?.toISOString()
            });
        });
    }

    // First solve map (only for original live subs)
    subs.filter((s:any) => !s.isUpsolve && !s.isVirtual && s.isCorrect).forEach((s: any) => {
        if (!firstSolveMap.has(s.problemId)) {
            const regId = isTeamContest ? s.teamId : (contest as any).registrations.find((r:any) => r.userId === s.userId && !r.isVirtual)?.id;
            if (regId) firstSolveMap.set(s.problemId, regId);
        }
    });

    const ratingDeltaMapObj = Object.fromEntries(ratingDeltaMap);
    const firstSolveMapObj = Object.fromEntries(firstSolveMap);

    return (
        <StandingsClient 
            contest={JSON.parse(JSON.stringify(contest))} 
            initialStandings={stands}
            firstSolveMap={firstSolveMapObj}
            ratingDeltaMap={ratingDeltaMapObj}
            viewerReg={viewerReg ? { id: viewerReg.id, startTime: viewerReg.startTime.toISOString(), isVirtual: true } : null}
        />
    );
}
