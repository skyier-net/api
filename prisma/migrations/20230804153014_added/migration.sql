/*
  Warnings:

  - Added the required column `invitedFrom` to the `GroupInvitation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GroupInvitation" ADD COLUMN     "invitedFrom" TEXT NOT NULL;
