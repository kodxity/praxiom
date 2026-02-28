import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title, description, startTime, endTime, themeSlug, accentColor } = await req.json();

    const contest = await prisma.contest.create({
        data: {
            title,
            description,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            status: 'SCHEDULED',
            themeSlug: themeSlug || 'global',
            accentColor: accentColor || null,
        }
    });

    return NextResponse.json(contest);
}
