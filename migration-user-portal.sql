-- Add donor portal tables to an existing blood_donor_system database.
-- Fresh installations already receive these tables from database/01-setup.sql.

USE `blood_donor_system`;

CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `username` VARCHAR(100) NOT NULL UNIQUE,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `mobile` VARCHAR(20) NOT NULL UNIQUE,
    `blood_group` VARCHAR(5) DEFAULT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('admin','user') NOT NULL DEFAULT 'user',
    `status` ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `blood_requests` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT DEFAULT NULL,
    `requester_name` VARCHAR(255) NOT NULL,
    `contact_mobile` VARCHAR(20) NOT NULL,
    `blood_group` VARCHAR(5) NOT NULL,
    `units_needed` INT NOT NULL DEFAULT 1,
    `hospital_name` VARCHAR(255) DEFAULT NULL,
    `location` VARCHAR(255) DEFAULT NULL,
    `urgency` ENUM('Low','Moderate','High','Critical') NOT NULL DEFAULT 'Moderate',
    `details` TEXT DEFAULT NULL,
    `status` ENUM('Open','Matched','Closed') NOT NULL DEFAULT 'Open',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;