# Virtual Contest Participation

Allow any logged-in user to "virtually participate" in past contests, simulating the full contest experience with a timer and live standings comparison.

## User Review Required

> [!IMPORTANT]
> **Key design decisions that need your input:**
>
> 1. **Reusing `Registration`**: The plan reuses the existing `Registration` model with a new `isVirtual` boolean, rather than creating a separate `VirtualParticipation` table. This means virtual participants are stored alongside real participants but flagged. The alternative is a separate table, which would isolate concerns but require duplicating the scoring logic.
>
> 2. **XP**: Should virtual participants earn XP for solving problems? The current plan marks virtual submissions with `isVirtual: true` and **does award XP**. All Virtual Contest solves 
>
> 3. **Multiple virtual attempts**: Should users be able to virtually participate more than once in the same contest? The current plan allows multiple virtual participation for any contest for any user. It will just show up as multiple participations on the standings.
>
> 4. **Live standings simulation**: During virtual participation, the standings page will show a simulated snapshot — filtering original submissions to only those that would have occurred by the equivalent elapsed time. Virtual participants see their own rank interleaved among the historical data. This is computed client-side by filtering the pre-loaded submission timestamps.

---

## Proposed Changes

### Database Schema

#### [MODIFY] [schema.prisma](file:///c:/Users/kodxity/Documents/projects/praxiom/prisma/schema.prisma)

Add `isVirtual` flag to `Registration` and `Submission`:

```diff
 model Registration {
   id        String    @id @default(cuid())
   userId    String
   contestId String
   createdAt DateTime  @default(now())
   startTime DateTime?
+  isVirtual Boolean   @default(false)
   contest   Contest   @relation(fields: [contestId], references: [id])
   user      User      @relation(fields: [userId], references: [id])
   @@unique([userId, contestId])
 }

 model Submission {
   ...
   isUpsolve Boolean      @default(false)
+  isVirtual Boolean      @default(false)
   ...
 }
```

- `Registration.isVirtual` — true for virtual participations
- `Submission.isVirtual` — true for submissions made during virtual participation

---

### API Routes

#### [NEW] [route.ts](file:///c:/Users/kodxity/Documents/projects/praxiom/src/app/api/contests/[id]/virtual/route.ts)

`POST /api/contests/[id]/virtual` — Start a virtual participation:
- Verify contest exists and has ended (`now > endTime`)
- Verify user isn't already registered (no double participation)
- Create a `Registration` with `isVirtual: true` and `startTime: now`
- Return success

---

#### [MODIFY] [route.ts](file:///c:/Users/kodxity/Documents/projects/praxiom/src/app/api/submissions/route.ts)

Modify submission logic:
- After detecting that a contest has ended (`now > contest.endTime`), check if the user has an active virtual registration
- If the user has a virtual reg with `startTime` and `now < virtualStartTime + duration`, mark submission with `isVirtual: true` instead of `isUpsolve: true`
- Virtual submissions: **no XP**, **no upsolve**, treated as contest-grade but flagged
- Sequential lock enforcement should work the same way for virtual

---

#### [MODIFY] [route.ts](file:///c:/Users/kodxity/Documents/projects/praxiom/src/app/api/contests/[id]/calculate-ratings/route.ts)

Ensure rating calculation excludes virtual participants:
- Filter out submissions where `isVirtual === true` when computing scores
- Already uses `contest.submissions`, just add `.filter(s => !s.isVirtual)`

---

### Frontend — Contest Page

#### [MODIFY] [ContestHero.tsx](file:///c:/Users/kodxity/Documents/projects/praxiom/src/components/ContestHero.tsx)

Add new props: `isVirtualParticipant`, `virtualEndTime`

For past & individual contests, show a **"Virtual Participation"** button:
- Only visible to logged-in, non-admin users who are **not** already registered
- Calls `POST /api/contests/[id]/virtual`, then refreshes the page
- Once started, show a personal countdown timer (like the normal start flow)

---

#### [MODIFY] [page.tsx](file:///c:/Users/kodxity/Documents/projects/praxiom/src/app/contests/[id]/page.tsx)

When the contest is past:
- Check if the user has a virtual `Registration` with `startTime`
- If virtual participation is active (`now < virtualStart + duration`), treat the contest as "active" for this user: show problems, enable submissions, show timer
- Pass `isVirtualParticipant` and `virtualEndTime` to [ContestHero](file:///c:/Users/kodxity/Documents/projects/praxiom/src/components/ContestHero.tsx#43-484)

---

### Frontend — Standings

#### [MODIFY] [page.tsx](file:///c:/Users/kodxity/Documents/projects/praxiom/src/app/contests/[id]/standings/page.tsx)

This is the most complex UI change:

1. **Include virtual participants in standings** — query `registrations` where `isVirtual = true` and their submissions where `isVirtual = true`
2. **"Virtual" badge** — next to virtual participant names, show a small `VIRTUAL` tag
3. **All / Live filter** — add filter buttons at the top:
   - **All** (default) — shows live + virtual participants together
   - **Live** — shows only non-virtual participants (original standings)
4. **Live simulation** during active virtual participation:
   - Convert standings to a client component (`StandingsClient`)
   - Pass all submission timestamps to the client
   - For virtual participants currently in progress, compute the equivalent "contest time" and filter the original submissions to show only those that happened before that elapsed time
   - Virtual participant's own submissions are interleaved into this filtered view
   - The standings refresh as time progresses (poll or timer-based re-render)

---

## Verification Plan

### TypeScript Compilation
```
node ./node_modules/typescript/bin/tsc --noEmit --skipLibCheck
```
This is a reliable check since we verified it works on the current codebase.

### Manual Verification

> [!NOTE]
> There are no existing automated tests in this project. The verification relies on TypeScript compilation and manual testing.

1. **Schema push**: Run `prisma db push` and verify no errors
2. **Virtual start flow**: 
   - Navigate to a past contest as a logged-in non-admin user
   - Verify "Virtual Participation" button appears
   - Click it → should register and start immediately, showing problems and a timer
3. **Virtual submissions**:
   - While virtually participating, submit answers to problems
   - Verify submissions are accepted and tracked (not marked as upsolve)
   - Verify no XP is awarded
4. **Standings**:
   - Navigate to the contest standings
   - Verify the virtual participant appears with a "Virtual" tag
   - Verify the "All / Live" filter works
   - During an active virtual participation, verify that the live standings simulation shows the historical snapshot at the user's current elapsed time
5. **Rating exclusion**:
   - Verify that `Calculate Ratings` (admin action) does not include virtual participants

I'd appreciate your input on testing — if you have a local dev server setup or a staging environment, let me know and I can refine the test steps.
