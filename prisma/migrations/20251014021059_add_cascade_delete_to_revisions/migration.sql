-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PageTag" (
    "pageId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    PRIMARY KEY ("pageId", "tagId"),
    CONSTRAINT "PageTag_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PageTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PageTag" ("pageId", "tagId") SELECT "pageId", "tagId" FROM "PageTag";
DROP TABLE "PageTag";
ALTER TABLE "new_PageTag" RENAME TO "PageTag";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
