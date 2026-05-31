-- AlterTable: Add emailVerified and emailVerifyToken columns to User
ALTER TABLE `User` ADD COLUMN `emailVerified` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `User` ADD COLUMN `emailVerifyToken` VARCHAR(191) NULL;
ALTER TABLE `User` ADD UNIQUE INDEX `User_emailVerifyToken_key`(`emailVerifyToken`);
