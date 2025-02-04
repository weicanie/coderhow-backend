-- CreateTable
CREATE TABLE `friendGroup` (
    `userId` INTEGER NOT NULL,
    `friendId` INTEGER NOT NULL,
    `name` VARCHAR(100) NOT NULL,

    INDEX `friendId`(`friendId`),
    PRIMARY KEY (`userId`, `friendId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
