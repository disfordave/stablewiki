/*
  Warnings:

  - You are about to drop the `CommentTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PageTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."CommentTag" DROP CONSTRAINT "CommentTag_commentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CommentTag" DROP CONSTRAINT "CommentTag_tagId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PageTag" DROP CONSTRAINT "PageTag_pageId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PageTag" DROP CONSTRAINT "PageTag_tagId_fkey";

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isLocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSoftDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "loungeDisabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pureAccessLevel" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "public"."CommentTag";

-- DropTable
DROP TABLE "public"."PageTag";

-- DropTable
DROP TABLE "public"."Tag";
