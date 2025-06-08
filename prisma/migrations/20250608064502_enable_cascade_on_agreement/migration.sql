-- DropForeignKey
ALTER TABLE "Support" DROP CONSTRAINT "Support_spaceId_fkey";

-- AddForeignKey
ALTER TABLE "Support" ADD CONSTRAINT "Support_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;
