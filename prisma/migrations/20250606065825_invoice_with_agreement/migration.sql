/*
  Warnings:

  - You are about to drop the column `invoiceId` on the `Agreement` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Agreement" DROP CONSTRAINT "Agreement_invoiceId_fkey";

-- DropIndex
DROP INDEX "Agreement_invoiceId_key";

-- AlterTable
ALTER TABLE "Agreement" DROP COLUMN "invoiceId";

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "agreementId" TEXT;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "Agreement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
