/*
  Warnings:

  - Changed the type of `amount` on the `payments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `payment_date` on the `payments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "payments" DROP COLUMN "amount",
ADD COLUMN     "amount" INTEGER NOT NULL,
DROP COLUMN "payment_date",
ADD COLUMN     "payment_date" TIMESTAMP(3) NOT NULL;
