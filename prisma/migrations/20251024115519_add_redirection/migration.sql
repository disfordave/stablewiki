-- AlterTable
ALTER TABLE "Revision" ADD COLUMN     "isRedirect" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "redirectTargetSlug" TEXT;
