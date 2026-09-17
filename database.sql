-- ============================================================
-- Blood Donor Management System - Database Schema
-- Version: 1.0
-- Engine: MySQL / MariaDB
-- ============================================================

CREATE DATABASE IF NOT EXISTS `blood_donor_system`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE `blood_donor_system`;

-- ============================================================
-- 1. ADMINS
-- ============================================================
CREATE TABLE IF NOT EXISTS `admins` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. DONORS
-- ============================================================
CREATE TABLE IF NOT EXISTS `donors` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `donor_name` VARCHAR(255) NOT NULL,
    `mobile` VARCHAR(20) NOT NULL,
    `whatsapp` VARCHAR(20) DEFAULT NULL,
    `email` VARCHAR(255) DEFAULT NULL,
    `address` TEXT DEFAULT NULL,
    `blood_group` VARCHAR(5) NOT NULL,
    `gender` ENUM('Male','Female','Other') NOT NULL,
    `date_of_birth` DATE DEFAULT NULL,
    `last_donation_date` DATE DEFAULT NULL,
    `status` ENUM('Active','Inactive') DEFAULT 'Active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `unique_mobile` (`mobile`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. BLOOD CAMPS
-- ============================================================
CREATE TABLE IF NOT EXISTS `blood_camps` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `camp_date` DATE NOT NULL,
    `start_time` TIME DEFAULT NULL,
    `end_time` TIME DEFAULT NULL,
    `location` TEXT NOT NULL,
    `description` TEXT DEFAULT NULL,
    `budget_amount` DECIMAL(12,2) DEFAULT NULL,
    `status` ENUM('Upcoming','Completed','Cancelled') DEFAULT 'Upcoming',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. CAMP REGISTRATIONS (attendance register)
--    One row per person per camp - the digital register book.
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
    UNIQUE KEY `unique_camp_mobile` (`camp_id`, `mobile`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4b. CAMP CONTRIBUTIONS (food, drinks, water bottles, cash)
--    What wellwishers GIVE to a camp. `amount` is the exact sum for
--    category 'Cash' and an optional estimated value for goods, so a
--    tray of buns is never mistaken for money in the tin.
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
-- 4c. CAMP EXPENSES
--    What the camp COST. 'Planned' rows are commitments not yet paid.
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
-- 5. STAFF (camp organising committee)
--
-- People who run a camp rather than give blood, so only a name and a
-- mobile number are kept. `mobile` is UNIQUE and every write goes
-- through normalizeMobile() first, so one person cannot get in twice
-- as "070 000 0000" and "+94700000000".
--
-- Defined before message_logs because that table has a foreign key
-- pointing at this one.
-- ============================================================
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
-- 6. MESSAGE LOGS
--
-- A row belongs to a donor or to a staff member, never both: the two
-- ids have foreign keys into different tables. Both null means the
-- recipient has since been deleted, and the message stays as a record.
-- ============================================================
CREATE TABLE IF NOT EXISTS `message_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `donor_id` INT DEFAULT NULL,
    `staff_id` INT DEFAULT NULL,
    -- Groups one send run together, so a retry of a part-finished
    -- campaign resumes instead of messaging everyone a second time.
    `campaign_id` CHAR(32) DEFAULT NULL,
    `message_type` ENUM('WhatsApp','SMS') NOT NULL,
    `mobile` VARCHAR(20) NOT NULL,
    `message` TEXT NOT NULL,
    `status` VARCHAR(50) DEFAULT 'Pending',
    `api_response` TEXT DEFAULT NULL,
    `sent_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`donor_id`) REFERENCES `donors`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`staff_id`) REFERENCES `staff`(`id`) ON DELETE SET NULL,
    INDEX `idx_campaign` (`campaign_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. MESSAGE TEMPLATES
-- ============================================================
CREATE TABLE IF NOT EXISTS `message_templates` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `template_name` VARCHAR(255) NOT NULL,
    `template_body` TEXT NOT NULL,
    `template_type` ENUM('Camp Notification','Emergency Request','General') DEFAULT 'General',
    -- WhatsApp requires a pre-approved template for any message sent
    -- outside the 24-hour customer service window. These columns tie a
    -- local template to the one approved in WhatsApp Manager.
    `whatsapp_template_name` VARCHAR(255) DEFAULT NULL,
    `whatsapp_language` VARCHAR(10) NOT NULL DEFAULT 'en',
    `whatsapp_variables` VARCHAR(255) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. LOGIN ATTEMPTS (brute-force throttling)
--
-- Every login attempt, successful or not. Failures are counted in two
-- windows - by email and by IP - so neither one account nor one host
-- can be ground down. Before this, login accepted unlimited attempts
-- at full speed with no record that an attack had happened.
--
-- Pruned by the application; holds no donor data.
-- ============================================================
CREATE TABLE IF NOT EXISTS `login_attempts` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL,
    `ip_address` VARCHAR(45) NOT NULL,
    `successful` TINYINT(1) NOT NULL DEFAULT 0,
    `attempted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_attempt_email` (`email`, `attempted_at`),
    INDEX `idx_attempt_ip` (`ip_address`, `attempted_at`),
    INDEX `idx_attempt_time` (`attempted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. SCHEMA MIGRATIONS (ledger)
--
-- Records which migration-*.sql files have been applied, so that
-- "which schema version is this database?" has a readable answer.
-- Restoring an unlabelled dump silently rolled this schema backwards
-- twice; the only symptom was a page going blank.
--
-- Managed by scripts/migrate.php. On a FRESH install every migration
-- is already contained in this file, so run:
--   php scripts/migrate.php baseline
-- ============================================================
CREATE TABLE IF NOT EXISTS `schema_migrations` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `filename` VARCHAR(255) NOT NULL UNIQUE,
    `checksum` CHAR(64) NOT NULL,
    `applied_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `method` ENUM('applied','baseline') NOT NULL DEFAULT 'applied',
    INDEX `idx_migration_applied` (`applied_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. SETTINGS (key-value store)
-- ============================================================
CREATE TABLE IF NOT EXISTS `settings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `setting_key` VARCHAR(100) NOT NULL UNIQUE,
    `setting_value` TEXT DEFAULT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- INDEXES for performance
-- ============================================================
ALTER TABLE `donors` ADD INDEX `idx_blood_group` (`blood_group`);
ALTER TABLE `donors` ADD INDEX `idx_status` (`status`);
ALTER TABLE `donors` ADD INDEX `idx_last_donation` (`last_donation_date`);
ALTER TABLE `blood_camps` ADD INDEX `idx_camp_date` (`camp_date`);
ALTER TABLE `blood_camps` ADD INDEX `idx_camp_status` (`status`);
ALTER TABLE `message_logs` ADD INDEX `idx_sent_at` (`sent_at`);
ALTER TABLE `message_logs` ADD INDEX `idx_message_type` (`message_type`);
ALTER TABLE `camp_registrations` ADD INDEX `idx_camp` (`camp_id`);
ALTER TABLE `camp_registrations` ADD INDEX `idx_reg_status` (`status`);
ALTER TABLE `camp_registrations` ADD INDEX `idx_reg_mobile` (`mobile`);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Default admin account.
--
-- The password below is a LOCKED placeholder, not a usable bcrypt hash:
-- password_verify() returns false for it, so a fresh install ships with no
-- working login. This is deliberate. Earlier versions seeded a real hash of
-- a weak password and documented it in this file, which meant every install
-- that forgot to change it had a publicly known admin account - on a system
-- holding donor names, phone numbers and blood groups.
--
-- Set a password before first login. Run this from the project root and type
-- the password when it waits for input (reading from stdin keeps it out of
-- your shell history):
--
--   php -r "echo password_hash(trim(fgets(STDIN)), PASSWORD_DEFAULT), PHP_EOL;"
--
-- Then apply the hash it prints:
--
--   UPDATE admins SET password = '<paste-the-hash>' WHERE email = 'admin@admin.com';
--
-- After signing in, set your own email and password on Settings > Admin Account.
INSERT INTO `admins` (`name`, `email`, `password`) VALUES
('Administrator', 'admin@admin.com', '!LOCKED-SET-PASSWORD-BEFORE-USE');

-- Default message templates
INSERT INTO `message_templates` (`template_name`, `template_body`, `template_type`, `whatsapp_template_name`, `whatsapp_language`, `whatsapp_variables`) VALUES
('Blood Camp Notification', 'Hello {NAME},\n\nOur upcoming blood donation camp will be held on:\n\nDate: {DATE}\nLocation: {LOCATION}\n\nWe would be grateful for your participation.\n\nThank you.', 'Camp Notification', 'blood_camp_notification', 'en', 'NAME,DATE,LOCATION'),
('Emergency Blood Request', 'Urgent Blood Request\n\nBlood Group: {BLOOD_GROUP}\nLocation: {LOCATION}\n\nPlease contact us immediately if you can donate.\n\nThank you.', 'Emergency Request', 'emergency_blood_request', 'en', 'BLOOD_GROUP,LOCATION'),
('General Announcement', 'Hello {NAME},\n\n{MESSAGE}\n\nThank you.', 'General', 'general_announcement', 'en', 'NAME,MESSAGE');

-- Default settings
INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES
('app_name', 'Blood Donor Management System'),
('organization_name', 'Blood Donor Organization'),
('country_code', '+94'),
('whatsapp_api_token', ''),
('whatsapp_phone_number_id', ''),
('whatsapp_api_version', 'v23.0'),
('sms_gateway', 'twilio'),
('sms_api_key', ''),
('sms_api_secret', ''),
('sms_sender_id', ''),
('currency_symbol', 'Rs.');
