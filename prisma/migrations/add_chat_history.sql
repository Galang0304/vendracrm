-- Add Chat History Tables
CREATE TABLE `ChatSession` (
  `id` VARCHAR(191) NOT NULL,
  `companyId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `subscriptionTier` VARCHAR(191) NOT NULL,
  `summary` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `lastActivity` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `expiresAt` DATETIME(3) NOT NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,

  PRIMARY KEY (`id`),
  INDEX `ChatSession_companyId_idx` (`companyId`),
  INDEX `ChatSession_userId_idx` (`userId`),
  INDEX `ChatSession_expiresAt_idx` (`expiresAt`),
  INDEX `ChatSession_lastActivity_idx` (`lastActivity`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ChatMessage` (
  `id` VARCHAR(191) NOT NULL,
  `sessionId` VARCHAR(191) NOT NULL,
  `message` TEXT NOT NULL,
  `isUser` BOOLEAN NOT NULL,
  `tokens` INTEGER NULL,
  `role` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  INDEX `ChatMessage_sessionId_idx` (`sessionId`),
  INDEX `ChatMessage_createdAt_idx` (`createdAt`),
  FOREIGN KEY (`sessionId`) REFERENCES `ChatSession`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add foreign key constraints
ALTER TABLE `ChatSession` ADD CONSTRAINT `ChatSession_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ChatSession` ADD CONSTRAINT `ChatSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Admin`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
