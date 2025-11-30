-- CreateTable
CREATE TABLE "WikiLink" (
    "id" SERIAL NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetSlug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WikiLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WikiLink_sourceId_idx" ON "WikiLink"("sourceId");

-- CreateIndex
CREATE INDEX "WikiLink_targetSlug_idx" ON "WikiLink"("targetSlug");

-- AddForeignKey
ALTER TABLE "WikiLink" ADD CONSTRAINT "WikiLink_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WikiLink" ADD CONSTRAINT "WikiLink_targetSlug_fkey" FOREIGN KEY ("targetSlug") REFERENCES "Page"("slug") ON DELETE SET NULL ON UPDATE CASCADE;
