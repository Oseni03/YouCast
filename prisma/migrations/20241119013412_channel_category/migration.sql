/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Channel` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the `_UserSubscriptions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Channel" DROP CONSTRAINT "Channel_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "_UserSubscriptions" DROP CONSTRAINT "_UserSubscriptions_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserSubscriptions" DROP CONSTRAINT "_UserSubscriptions_B_fkey";

-- AlterTable
ALTER TABLE "Channel" DROP COLUMN "categoryId";

-- AlterTable
ALTER TABLE "Video" DROP COLUMN "categoryId";

-- DropTable
DROP TABLE "_UserSubscriptions";

-- CreateTable
CREATE TABLE "UserSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSubscription_userId_channelId_key" ON "UserSubscription"("userId", "channelId");

-- AddForeignKey
ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
