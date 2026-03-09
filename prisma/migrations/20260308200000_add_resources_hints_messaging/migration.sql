-- Additive-only migration: adds missing columns/tables.
-- Uses IF NOT EXISTS / DO...EXCEPTION blocks so it is safe to apply
-- even if a previous `prisma db push` already created these objects.

-- ─── User: xp ────────────────────────────────────────────────────────────────
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "xp" INTEGER NOT NULL DEFAULT 0;

-- ─── Problem: hint ────────────────────────────────────────────────────────────
ALTER TABLE "Problem" ADD COLUMN IF NOT EXISTS "hint" TEXT;

-- ─── Submission: hintUsed ─────────────────────────────────────────────────────
ALTER TABLE "Submission" ADD COLUMN IF NOT EXISTS "hintUsed" BOOLEAN NOT NULL DEFAULT false;

-- ─── HintReveal ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "HintReveal" (
    "userId"    TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HintReveal_pkey" PRIMARY KEY ("userId","problemId")
);

DO $$ BEGIN
    ALTER TABLE "HintReveal" ADD CONSTRAINT "HintReveal_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "HintReveal" ADD CONSTRAINT "HintReveal_problemId_fkey"
        FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── Resource ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Resource" (
    "id"         TEXT NOT NULL,
    "title"      TEXT NOT NULL,
    "content"    TEXT NOT NULL,
    "authorId"   TEXT NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "schoolId"   TEXT,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
    ALTER TABLE "Resource" ADD CONSTRAINT "Resource_authorId_fkey"
        FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "Resource" ADD CONSTRAINT "Resource_schoolId_fkey"
        FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── GroupMessage ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "GroupMessage" (
    "id"        TEXT NOT NULL,
    "groupId"   TEXT NOT NULL,
    "authorId"  TEXT NOT NULL,
    "content"   TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GroupMessage_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
    ALTER TABLE "GroupMessage" ADD CONSTRAINT "GroupMessage_groupId_fkey"
        FOREIGN KEY ("groupId") REFERENCES "OrgGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "GroupMessage" ADD CONSTRAINT "GroupMessage_authorId_fkey"
        FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── GroupMessageRead ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "GroupMessageRead" (
    "messageId" TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "readAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GroupMessageRead_pkey" PRIMARY KEY ("messageId","userId")
);

DO $$ BEGIN
    ALTER TABLE "GroupMessageRead" ADD CONSTRAINT "GroupMessageRead_messageId_fkey"
        FOREIGN KEY ("messageId") REFERENCES "GroupMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "GroupMessageRead" ADD CONSTRAINT "GroupMessageRead_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
