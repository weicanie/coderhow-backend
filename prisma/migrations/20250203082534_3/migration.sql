/*
  Warnings:

  - You are about to drop the column `status` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `status`,
    ADD COLUMN `online_status` BOOLEAN NOT NULL DEFAULT true;
