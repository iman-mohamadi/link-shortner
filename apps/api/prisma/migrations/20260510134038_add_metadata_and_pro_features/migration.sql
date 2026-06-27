-- AlterTable
ALTER TABLE "Link" ADD COLUMN     "description" TEXT,
ADD COLUMN     "favicon" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "title" TEXT;
