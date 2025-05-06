/*
  Warnings:

  - A unique constraint covering the columns `[invoiceId]` on the table `Agreement` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Agreement" ADD COLUMN     "invoiceId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Agreement_invoiceId_key" ON "Agreement"("invoiceId");

-- AddForeignKey
ALTER TABLE "Agreement" ADD CONSTRAINT "Agreement_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
