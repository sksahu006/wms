/*
  Warnings:

  - You are about to drop the column `endDate` on the `Agreement` table. All the data in the column will be lost.
  - You are about to drop the column `rent` on the `Agreement` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Agreement` table. All the data in the column will be lost.
  - Added the required column `areaSqft` to the `Agreement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactPerson` to the `Agreement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `monthlyRentAmount` to the `Agreement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rentStartDate` to the `Agreement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `spaceType` to the `Agreement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Agreement" DROP COLUMN "endDate",
DROP COLUMN "rent",
DROP COLUMN "startDate",
ADD COLUMN     "agreementPeriod" INTEGER,
ADD COLUMN     "areaSqft" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "clientName" TEXT,
ADD COLUMN     "contactPerson" TEXT NOT NULL,
ADD COLUMN     "electricityCharges" DOUBLE PRECISION,
ADD COLUMN     "handoverDate" TIMESTAMP(3),
ADD COLUMN     "monthlyRatePerSqft" DOUBLE PRECISION,
ADD COLUMN     "monthlyRentAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "rateEscalationDate" TIMESTAMP(3),
ADD COLUMN     "rateEscalationPercent" DOUBLE PRECISION,
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "rentStartDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "spaceType" "SpaceType" NOT NULL,
ADD COLUMN     "waterCharges" DOUBLE PRECISION;
