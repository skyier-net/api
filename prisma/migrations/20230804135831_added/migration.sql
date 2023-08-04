/*
  Warnings:

  - You are about to drop the `GroupInvitations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "GroupInvitations";

-- CreateTable
CREATE TABLE "GroupInvitation" (
    "key" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "mail" TEXT,

    CONSTRAINT "GroupInvitation_pkey" PRIMARY KEY ("key")
);
