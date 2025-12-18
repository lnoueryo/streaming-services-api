/*
  Warnings:

  - You are about to drop the column `joinedAt` on the `space_members` table. All the data in the column will be lost.
  - You are about to drop the column `spaceId` on the `space_members` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `space_members` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[space_id,email]` on the table `space_members` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `space_members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `space_id` to the `space_members` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `space_members` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `space_members` DROP FOREIGN KEY `space_members_spaceId_fkey`;

-- DropIndex
DROP INDEX `space_members_spaceId_userId_key` ON `space_members`;

-- AlterTable
ALTER TABLE `space_members` DROP COLUMN `joinedAt`,
    DROP COLUMN `spaceId`,
    DROP COLUMN `userId`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `email` VARCHAR(191) NOT NULL,
    ADD COLUMN `joined_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `space_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    ADD COLUMN `user_id` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `space_members_space_id_email_key` ON `space_members`(`space_id`, `email`);

-- AddForeignKey
ALTER TABLE `space_members` ADD CONSTRAINT `space_members_space_id_fkey` FOREIGN KEY (`space_id`) REFERENCES `spaces`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
