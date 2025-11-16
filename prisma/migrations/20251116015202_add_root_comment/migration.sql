-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "rootCommentId" TEXT;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_rootCommentId_fkey" FOREIGN KEY ("rootCommentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
