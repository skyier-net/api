/*
  Warnings:

  - You are about to drop the column `invitedFrom` on the `GroupInvitation` table. All the data in the column will be lost.
  - Added the required column `inviterId` to the `GroupInvitation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GroupInvitation" DROP COLUMN "invitedFrom",
ADD COLUMN     "inviterId" TEXT NOT NULL;
