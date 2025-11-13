-- DropForeignKey
ALTER TABLE "public"."Comment" DROP CONSTRAINT "Comment_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CommentTag" DROP CONSTRAINT "CommentTag_tagId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PageTag" DROP CONSTRAINT "PageTag_tagId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Reaction" DROP CONSTRAINT "Reaction_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Revision" DROP CONSTRAINT "Revision_authorId_fkey";

-- DropIndex
DROP INDEX "public"."TrustCredit_userId_key";

-- AlterTable
ALTER TABLE "Comment" ALTER COLUMN "authorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Reaction" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Revision" ALTER COLUMN "authorId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Comment_pageId_authorId_idx" ON "Comment"("pageId", "authorId");

-- CreateIndex
CREATE INDEX "Page_authorId_idx" ON "Page"("authorId");

-- CreateIndex
CREATE INDEX "Reaction_userId_commentId_idx" ON "Reaction"("userId", "commentId");

-- CreateIndex
CREATE INDEX "Revision_pageId_idx" ON "Revision"("pageId");

-- CreateIndex
CREATE INDEX "TrustCredit_userId_idx" ON "TrustCredit"("userId");

-- AddForeignKey
ALTER TABLE "Revision" ADD CONSTRAINT "Revision_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageTag" ADD CONSTRAINT "PageTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentTag" ADD CONSTRAINT "CommentTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
