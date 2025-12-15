-- AlterTable
ALTER TABLE `spaces` ADD COLUMN `creator_id` VARCHAR(191) NULL DEFAULT 'MSFTC5vJgmhTkN4c4uUfO922vCq2',
    ADD COLUMN `name` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `space_members` (
    `id` VARCHAR(191) NOT NULL,
    `spaceId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `role` ENUM('owner', 'admin', 'member') NOT NULL DEFAULT 'member',
    `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'approved',
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `space_members_spaceId_userId_key`(`spaceId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `space_members` ADD CONSTRAINT `space_members_spaceId_fkey` FOREIGN KEY (`spaceId`) REFERENCES `spaces`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
