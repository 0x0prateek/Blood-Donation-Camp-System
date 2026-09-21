-- ============================================================
-- Migration: Organising committee (staff)
-- Version: 1.3
-- Run this ONCE against an existing blood_donor_system database.
-- Fresh installs get this automatically from database.sql.
--
-- Staff are the people who organise a camp, not people who give blood,
-- so only a name and a mobile number are recorded. None of the donor
-- medical fields apply to them and none are carried over.
--
-- `mobile` is UNIQUE for the same reason it is on donors: the T.P.
-- number identifies a person. Every write goes through normalizeMobile()
-- first, so the numbers are all stored in one canonical 07XXXXXXXX form
-- and the unique key actually bites - "070 000 0000" and "+94700000000"
-- cannot both get in as separate committee members.
-- ============================================================

USE `blood_donor_system`;

CREATE TABLE IF NOT EXISTS `staff` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `mobile` VARCHAR(20) NOT NULL UNIQUE,
    `status` ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_staff_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- message_logs.donor_id has a foreign key into donors, so it cannot
-- carry a staff id. Committee messages get their own column instead of
-- overloading that one; a log row has at most one of the two set.
--
-- Guarded so the migration can be re-run: MySQL has no
-- "ADD COLUMN IF NOT EXISTS".
-- ============================================================
SET @col_exists = (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'message_logs'
      AND COLUMN_NAME  = 'staff_id'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE `message_logs`
        ADD COLUMN `staff_id` INT DEFAULT NULL AFTER `donor_id`,
        ADD CONSTRAINT `fk_message_logs_staff`
            FOREIGN KEY (`staff_id`) REFERENCES `staff`(`id`) ON DELETE SET NULL',
    'SELECT "message_logs.staff_id already exists" AS note'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
