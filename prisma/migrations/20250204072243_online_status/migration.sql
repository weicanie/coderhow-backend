/*
  Warnings:

  - You are about to alter the column `online_status` on the `user` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `VarChar(100)`.

*/
-- AlterTable
ALTER TABLE `user` MODIFY `online_status` VARCHAR(100) NULL;
