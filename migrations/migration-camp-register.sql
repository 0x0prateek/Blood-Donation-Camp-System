-- ============================================================
-- Migration: Camp Registration (Attendance Register)
-- Version: 1.1
-- Run this ONCE against an existing blood_donor_system database.
-- Fresh installs get this automatically from database.sql.
--
-- The T.P. (mobile) number is the unique identifier for a person,
-- matching the paper register book. `donors`.`mobile` already has
-- a UNIQUE key, so no change to the donors table is needed.
-- ============================================================

USE `blood_donor_system`;

-- ============================================================
-- Camp registration / attendance register
-- One row per person per camp - the digital version of the
-- school-style register book.
-- UNIQUE (camp_id, mobile) stops the same T.P. being marked
-- in twice at the same camp.
-- ============================================================
CREATE TABLE IF NOT EXISTS `camp_registrations` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `camp_id` INT NOT NULL,
    `donor_id` INT DEFAULT NULL,
    `serial_no` INT DEFAULT NULL,
    `mobile` VARCHAR(20) NOT NULL,
    `donor_name` VARCHAR(255) NOT NULL,
    `address` TEXT DEFAULT NULL,
    `blood_group` VARCHAR(5) DEFAULT NULL,
    `gender` ENUM('Male','Female','Other') DEFAULT NULL,
    `date_of_birth` DATE DEFAULT NULL,
    `status` ENUM('Registered','Donated','Rejected','No Show') DEFAULT 'Registered',
    `remarks` TEXT DEFAULT NULL,
    `registered_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `registered_by` INT DEFAULT NULL,
    FOREIGN KEY (`camp_id`) REFERENCES `blood_camps`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`donor_id`) REFERENCES `donors`(`id`) ON DELETE SET NULL,
    UNIQUE KEY `unique_camp_mobile` (`camp_id`, `mobile`),
    INDEX `idx_camp` (`camp_id`),
    INDEX `idx_reg_status` (`status`),
    INDEX `idx_reg_mobile` (`mobile`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
