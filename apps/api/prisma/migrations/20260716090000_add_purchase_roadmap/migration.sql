-- CreateTable
CREATE TABLE `PurchaseRoadmap` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `totalBudget` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PurchaseRoadmap_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RoadmapItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roadmapId` INTEGER NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `reason` VARCHAR(191) NULL,
    `estimatedPrice` INTEGER NOT NULL,
    `priority` INTEGER NOT NULL,
    `order` INTEGER NOT NULL,
    `isPurchased` BOOLEAN NOT NULL DEFAULT false,
    `purchasedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `RoadmapItem_roadmapId_idx`(`roadmapId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PurchaseRoadmap` ADD CONSTRAINT `PurchaseRoadmap_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoadmapItem` ADD CONSTRAINT `RoadmapItem_roadmapId_fkey` FOREIGN KEY (`roadmapId`) REFERENCES `PurchaseRoadmap`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
