/*
  Warnings:

  - Changed the type of `payment_time` on the `payments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "payments" DROP COLUMN "payment_time",
ADD COLUMN     "payment_time" TIMESTAMP(3) NOT NULL;
