/*
  Warnings:

  - The values [IN_USE] on the enum `SpaceStatus` will be removed. If these variants are still used in the database, this will fail.
  - The `type` column on the `Space` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[spaceCode]` on the table `Space` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Space` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `size` on the `Space` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "SpaceType" AS ENUM ('REGULAR', 'COLD', 'HAZARDOUS', 'OUTDOOR');

-- AlterEnum
BEGIN;
CREATE TYPE "SpaceStatus_new" AS ENUM ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED');
ALTER TABLE "Space" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Space" ALTER COLUMN "status" TYPE "SpaceStatus_new" USING ("status"::text::"SpaceStatus_new");
ALTER TYPE "SpaceStatus" RENAME TO "SpaceStatus_old";
ALTER TYPE "SpaceStatus_new" RENAME TO "SpaceStatus";
DROP TYPE "SpaceStatus_old";
ALTER TABLE "Space" ALTER COLUMN "status" SET DEFAULT 'AVAILABLE';
COMMIT;

-- AlterTable
ALTER TABLE "Space" ADD COLUMN     "description" TEXT,
ADD COLUMN     "features" TEXT[],
ADD COLUMN     "height" DOUBLE PRECISION,
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "location" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "rate" DOUBLE PRECISION,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "SpaceType" NOT NULL DEFAULT 'REGULAR',
DROP COLUMN "size",
ADD COLUMN     "size" DOUBLE PRECISION NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Space_spaceCode_key" ON "Space"("spaceCode");
