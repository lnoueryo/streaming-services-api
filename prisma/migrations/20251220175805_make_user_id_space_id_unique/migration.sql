/*
  Warnings:

  - A unique constraint covering the columns `[space_id,user_id]` on the table `space_members` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `space_members_space_id_user_id_key` ON `space_members`(`space_id`, `user_id`);
