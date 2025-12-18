-- AlterTable
ALTER TABLE `space_members` MODIFY `status` ENUM('none', 'pending', 'approved', 'rejected') NOT NULL DEFAULT 'none';

-- AlterTable
ALTER TABLE `spaces` MODIFY `privacy` ENUM('public', 'protected', 'private') NOT NULL DEFAULT 'public';
