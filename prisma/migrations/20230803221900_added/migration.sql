-- CreateEnum
CREATE TYPE "GroupVisibility" AS ENUM ('PUBLIC', 'UNLISTED', 'PRIVATE');

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "groupVisibility" "GroupVisibility" NOT NULL DEFAULT 'PRIVATE';
