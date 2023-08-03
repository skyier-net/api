-- CreateTable
CREATE TABLE "GroupInvitations" (
    "key" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "GroupInvitations_pkey" PRIMARY KEY ("key")
);

-- AddForeignKey
ALTER TABLE "GroupInvitations" ADD CONSTRAINT "GroupInvitations_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
