/*
  Warnings:

  - Added the required column `category` to the `Support` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priority` to the `Support` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Support" ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "document" TEXT,
ADD COLUMN     "priority" TEXT NOT NULL,
ADD COLUMN     "spaceId" TEXT;

-- AddForeignKey
ALTER TABLE "Support" ADD CONSTRAINT "Support_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE SET NULL ON UPDATE CASCADE;
