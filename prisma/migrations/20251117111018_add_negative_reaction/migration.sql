-- CreateTable
CREATE TABLE "NegativeReaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "commentId" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NegativeReaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NegativeReaction_userId_commentId_idx" ON "NegativeReaction"("userId", "commentId");

-- CreateIndex
CREATE UNIQUE INDEX "NegativeReaction_userId_commentId_type_key" ON "NegativeReaction"("userId", "commentId", "type");

-- AddForeignKey
ALTER TABLE "NegativeReaction" ADD CONSTRAINT "NegativeReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NegativeReaction" ADD CONSTRAINT "NegativeReaction_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
