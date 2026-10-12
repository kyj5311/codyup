-- AlterTable
ALTER TABLE `RoadmapItem`
    ADD COLUMN `itemName` VARCHAR(191) NOT NULL,
    ADD COLUMN `recommendedColorName` VARCHAR(191) NULL,
    ADD COLUMN `recommendedColorHex` VARCHAR(191) NULL,
    CHANGE COLUMN `estimatedPrice` `estimatedPriceKrw` INTEGER NOT NULL,
    MODIFY COLUMN `priority` VARCHAR(191) NOT NULL,
    MODIFY COLUMN `reason` VARCHAR(191) NOT NULL;
