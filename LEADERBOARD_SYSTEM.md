# Leaderboard System Documentation

## Overview
The platform now has **two types of leaderboards**:

### 1. Global Leaderboard (`/leaderboard`)
- Shows **all approved users** ranked by their **overall rating**
- Displays:
  - User rank
  - Username (color-coded by rating tier)
  - Number of contests participated in
  - Current rating
- Updates after each contest when ratings are calculated

### 2. Contest-Specific Standings (`/contests/[id]/standings`)
- Shows **all registered users** for a specific contest
- Real-time updates during the contest
- Displays:
  - User rank (sorted by score)
  - Username and current rating
  - **Total score** for the contest
  - **Per-problem status**:
    - ✅ Solved: Shows points earned (+XX) in green
    - ❌ Wrong attempts: Shows penalty (-XX) in red
    - ⏱️ **Solve time**: Shows time elapsed from contest start (e.g., "45m" or "1h 23m")
    - Attempt count: Shows wrong attempts before solving
  - Users with 0 submissions appear with score of 0

## How It Works

### Registration Flow
1. User navigates to a contest page
2. Clicks "Register for Contest" button
3. User is added to the contest's registration list
4. User can now enter the arena when contest is active

### During Contest
- Users can access the **Arena** to solve problems
- **"View Standings" button** in arena header opens standings in new tab
- Standings update in real-time as users submit answers
- Each correct answer adds points (minus penalties for wrong attempts)
- Solve times are tracked relative to contest start time

### Scoring System
- **Correct answer**: Problem points - (wrong attempts × 10)
- **Minimum score per solve**: 30% of problem points
- **Wrong answer**: -10 points penalty
- Users are ranked by total score (highest first)

### After Contest
- Admin can calculate rating changes via "Calculate Ratings" button
- User ratings update based on contest performance
- Rating history is saved and displayed on user profiles
- Global leaderboard reflects new ratings

## Key Features
✅ All registered users appear on standings (even with 0 score)
✅ Real-time score updates
✅ Solve time tracking (from contest start)
✅ Penalty system for wrong answers
✅ Accessible from arena during contest
✅ Separate from global rating leaderboard
