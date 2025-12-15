/*
  Warnings:

  - Made the column `creator_id` on table `spaces` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `spaces` MODIFY `creator_id` VARCHAR(191) NOT NULL;
