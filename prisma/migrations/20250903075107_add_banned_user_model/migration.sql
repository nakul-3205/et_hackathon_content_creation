-- AlterTable
ALTER TABLE "public"."FlaggedPrompt" ADD COLUMN     "banCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."BannedUser" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "bannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bannedUntil" TIMESTAMP(3) NOT NULL,
    "isPermanent" BOOLEAN NOT NULL DEFAULT false,
    "reason" TEXT,

    CONSTRAINT "BannedUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BannedUser_userId_key" ON "public"."BannedUser"("userId");
