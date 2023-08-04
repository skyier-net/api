/*
  Warnings:

  - You are about to drop the column `userId` on the `GroupInvitations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Group" ALTER COLUMN "groupVisibility" SET DEFAULT 'PUBLIC';

-- AlterTable
ALTER TABLE "GroupInvitations" DROP COLUMN "userId",
ADD COLUMN     "mail" TEXT;
