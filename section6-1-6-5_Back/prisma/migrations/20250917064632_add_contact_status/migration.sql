-- AlterTable
ALTER TABLE `ContactMessage` ADD COLUMN `status` ENUM('NEW', 'DONE') NOT NULL DEFAULT 'NEW';
