-- AlterTable
ALTER TABLE "User" ADD COLUMN     "balanceAmount" INTEGER DEFAULT 0,
ADD COLUMN     "billedAmount" INTEGER DEFAULT 0,
ADD COLUMN     "openingBalance" INTEGER DEFAULT 0,
ADD COLUMN     "receivedAmount" INTEGER DEFAULT 0;
