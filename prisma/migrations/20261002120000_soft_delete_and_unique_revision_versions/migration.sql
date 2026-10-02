-- Soft delete replaces the unused isSoftDeleted flag
ALTER TABLE "Page" DROP COLUMN "isSoftDeleted",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedById" TEXT;

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Concurrent edits used to be able to produce duplicate version numbers.
-- Renumber each page's revisions in order (only rows that are out of
-- sequence change) so the unique index below can be created.
WITH ordered AS (
    SELECT "id",
           ROW_NUMBER() OVER (
               PARTITION BY "pageId"
               ORDER BY "version", "createdAt", "id"
           ) AS "position"
    FROM "Revision"
)
UPDATE "Revision" AS r
SET "version" = ordered."position"
FROM ordered
WHERE r."id" = ordered."id"
  AND r."version" <> ordered."position";

-- CreateIndex
CREATE UNIQUE INDEX "Revision_pageId_version_key" ON "Revision"("pageId", "version");

-- Page.content now mirrors the latest revision so reads and search can use it
UPDATE "Page" AS p
SET "content" = latest."content"
FROM (
    SELECT DISTINCT ON ("pageId") "pageId", "content"
    FROM "Revision"
    ORDER BY "pageId", "version" DESC, "createdAt" DESC, "id" DESC
) AS latest
WHERE p."id" = latest."pageId";
