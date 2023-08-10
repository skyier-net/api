/*
  Warnings:

  - Added the required column `key` to the `UserToGroupRelation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mutedUntil` to the `UserToGroupRelation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserToGroupRelation" ADD COLUMN     "key" TEXT NOT NULL,
ADD COLUMN     "mutedUntil" BIGINT NOT NULL;
