/*
  Warnings:

  - You are about to drop the column `recoveryAnswerFirst` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `recoveryAnswerSecond` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `recoveryAnswerThird` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `recoveryQuestionFirst` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `recoveryQuestionSecond` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `recoveryQuestionThird` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "ageRating" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isTemplate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "licenseText" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "recoveryAnswerFirst",
DROP COLUMN "recoveryAnswerSecond",
DROP COLUMN "recoveryAnswerThird",
DROP COLUMN "recoveryQuestionFirst",
DROP COLUMN "recoveryQuestionSecond",
DROP COLUMN "recoveryQuestionThird",
ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "totalTrustCredits" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "CommentTag" (
    "commentId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "CommentTag_pkey" PRIMARY KEY ("commentId","tagId")
);

-- CreateTable
CREATE TABLE "TrustCredit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrustCredit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TrustCredit_userId_key" ON "TrustCredit"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Reaction_userId_commentId_type_key" ON "Reaction"("userId", "commentId", "type");

-- AddForeignKey
ALTER TABLE "CommentTag" ADD CONSTRAINT "CommentTag_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentTag" ADD CONSTRAINT "CommentTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrustCredit" ADD CONSTRAINT "TrustCredit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
