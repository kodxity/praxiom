# Virtual Contest Feature

## Planning
- [x] Research existing contest system (schema, APIs, standings, ContestHero)
- [/] Write implementation plan
- [ ] Get user approval

## Schema
- [x] Add `isVirtual` to `Registration` model
- [x] Push schema changes

## API Routes
- [x] Create `POST /api/contests/[id]/virtual` — start virtual participation
- [x] Modify `POST /api/submissions` — support virtual submissions
- [x] Modify `POST /api/contests/[id]/start` — support virtual start (not actually needed since virtual route handles it)
- [x] Ensure calculate-ratings excludes virtual participants

## Frontend — Contest Page
- [ ] Add "Virtual Participation" button to ContestHero for past contests
- [ ] Handle virtual contest flow (register + start → show problems with timer)

## Frontend — Standings
- [ ] Show virtual participants with "Virtual" tag in standings
- [ ] Add "All / Live" filter toggle
- [ ] Implement live simulation of standings at time X during virtual participation

## Submission Flow
- [ ] Allow submissions during virtual window (not marked as upsolve)
- [ ] Ensure virtual submissions don't affect ratings or XP

## Verification
- [ ] TypeScript compilation check
- [ ] Manual testing via browser
