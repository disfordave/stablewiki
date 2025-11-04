-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "accessLevel" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Revision" ADD COLUMN     "title" TEXT NOT NULL DEFAULT '';
