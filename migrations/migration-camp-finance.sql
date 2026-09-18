-- ============================================================
-- Migration: Camp Budget, Contributions and Expenses
-- Version: 1.2
-- Run this ONCE against an existing blood_donor_system database.
-- Fresh installs get this automatically from database.sql.
--
-- Two separate things are tracked per camp:
--
--   1. camp_contributions - what wellwishers GIVE to the camp.
--      Mostly food, soft drinks and water bottles handed over on the
--      day, sometimes cash. Goods carry an optional estimated value
--      so the committee can show what the camp was worth without
--      pretending the food was a cash receipt.
--
--   2. camp_expenses - what the organisers PAY OUT for the camp.
--
-- The budget figure itself lives on blood_camps, because a camp has
-- exactly one planned budget.
-- ============================================================

USE `blood_donor_system`;

-- ============================================================
-- Planned budget for the camp (NULL = no budget set yet)
-- Guarded so the migration can be re-run safely; MySQL has no
-- "ADD COLUMN IF NOT EXISTS".
-- ============================================================
SET @col_exists = (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'blood_camps'
      AND COLUMN_NAME  = 'budget_amount'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE `blood_camps` ADD COLUMN `budget_amount` DECIMAL(12,2) DEFAULT NULL AFTER `description`',
    'SELECT "blood_camps.budget_amount already exists" AS note'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================
-- Contributions - food, drinks, water bottles, cash
--
-- `amount` carries the money value in both cases:
--   category = 'Cash'  -> the exact amount handed over
--   otherwise          -> the ESTIMATED value of the goods, optional.
-- Keeping it in one column means a report never has to guess which
-- of two money columns to read, and the two are always summed apart
-- because the category tells them apart.
-- ============================================================
CREATE TABLE IF NOT EXISTS `camp_contributions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `camp_id` INT NOT NULL,
    `contributor_name` VARCHAR(255) NOT NULL,
    `mobile` VARCHAR(20) DEFAULT NULL,
    `category` ENUM('Food','Drinks','Water','Snacks','Medical','Equipment','Cash','Other') NOT NULL DEFAULT 'Food',
    `item_name` VARCHAR(255) DEFAULT NULL,
    `quantity` DECIMAL(10,2) DEFAULT NULL,
    `unit` VARCHAR(50) DEFAULT NULL,
    `amount` DECIMAL(12,2) DEFAULT NULL,
    `status` ENUM('Pledged','Received') NOT NULL DEFAULT 'Received',
    `received_date` DATE DEFAULT NULL,
    `remarks` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `recorded_by` INT DEFAULT NULL,
    FOREIGN KEY (`camp_id`) REFERENCES `blood_camps`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`recorded_by`) REFERENCES `admins`(`id`) ON DELETE SET NULL,
    INDEX `idx_contrib_camp` (`camp_id`),
    INDEX `idx_contrib_category` (`category`),
    INDEX `idx_contrib_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Expenses - what the camp cost
-- 'Planned' rows are commitments not yet paid, so the page can show
-- both what has left the tin and what is still owed.
-- ============================================================
CREATE TABLE IF NOT EXISTS `camp_expenses` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `camp_id` INT NOT NULL,
    `category` ENUM('Food','Drinks','Water','Transport','Printing','Venue','Medical','Decoration','Volunteer','Other') NOT NULL DEFAULT 'Other',
    `description` VARCHAR(255) NOT NULL,
    `paid_to` VARCHAR(255) DEFAULT NULL,
    `amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `payment_method` ENUM('Cash','Bank Transfer','Card','Online','Other') NOT NULL DEFAULT 'Cash',
    `status` ENUM('Planned','Paid') NOT NULL DEFAULT 'Paid',
    `expense_date` DATE DEFAULT NULL,
    `receipt_no` VARCHAR(100) DEFAULT NULL,
    `remarks` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `recorded_by` INT DEFAULT NULL,
    FOREIGN KEY (`camp_id`) REFERENCES `blood_camps`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`recorded_by`) REFERENCES `admins`(`id`) ON DELETE SET NULL,
    INDEX `idx_expense_camp` (`camp_id`),
    INDEX `idx_expense_category` (`category`),
    INDEX `idx_expense_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Currency symbol used on the budget screens and exports
-- ============================================================
INSERT INTO `settings` (`setting_key`, `setting_value`)
VALUES ('currency_symbol', 'Rs.')
ON DUPLICATE KEY UPDATE `setting_key` = `setting_key`;
