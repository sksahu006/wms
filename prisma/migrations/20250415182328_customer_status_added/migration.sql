/*
  Warnings:

  - You are about to drop the column `isActive` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isActive",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'PENDING';
