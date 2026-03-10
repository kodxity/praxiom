-- AlterTable: add contestType to Contest
ALTER TABLE "Contest" ADD COLUMN "contestType" TEXT NOT NULL DEFAULT 'individual';

-- AlterTable: add teamId to Submission
ALTER TABLE "Submission" ADD COLUMN "teamId" TEXT;

-- CreateTable: ContestTeam
CREATE TABLE "ContestTeam" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "leaderUserId" TEXT NOT NULL,
    "maxSize" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'FORMING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContestTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ContestTeamMember
CREATE TABLE "ContestTeamMember" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "relayOrder" INTEGER,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContestTeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ContestTeamInvite
CREATE TABLE "ContestTeamInvite" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "invitedUserId" TEXT NOT NULL,
    "invitedByUserId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContestTeamInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ContestTeamJoinRequest
CREATE TABLE "ContestTeamJoinRequest" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContestTeamJoinRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContestTeam_contestId_name_key" ON "ContestTeam"("contestId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ContestTeamMember_teamId_userId_key" ON "ContestTeamMember"("teamId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ContestTeamJoinRequest_teamId_userId_key" ON "ContestTeamJoinRequest"("teamId", "userId");

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "ContestTeam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestTeam" ADD CONSTRAINT "ContestTeam_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestTeam" ADD CONSTRAINT "ContestTeam_leaderUserId_fkey" FOREIGN KEY ("leaderUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestTeamMember" ADD CONSTRAINT "ContestTeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "ContestTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestTeamMember" ADD CONSTRAINT "ContestTeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestTeamInvite" ADD CONSTRAINT "ContestTeamInvite_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestTeamInvite" ADD CONSTRAINT "ContestTeamInvite_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "ContestTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestTeamInvite" ADD CONSTRAINT "ContestTeamInvite_invitedUserId_fkey" FOREIGN KEY ("invitedUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestTeamInvite" ADD CONSTRAINT "ContestTeamInvite_invitedByUserId_fkey" FOREIGN KEY ("invitedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestTeamJoinRequest" ADD CONSTRAINT "ContestTeamJoinRequest_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestTeamJoinRequest" ADD CONSTRAINT "ContestTeamJoinRequest_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "ContestTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestTeamJoinRequest" ADD CONSTRAINT "ContestTeamJoinRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
