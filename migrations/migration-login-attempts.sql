-- ============================================================
-- Migration: login attempt throttling
-- Version: 1.5
-- Run this ONCE against an existing blood_donor_system database.
-- Fresh installs get this automatically from database.sql.
--
-- Before this table, ajax/login.php accepted unlimited password
-- attempts at full speed, with no delay, no lockout, and no record
-- that an attack had happened. A single admin account guarding 488
-- people's health data was one script away from being guessed.
--
-- Every attempt is recorded, successful or not. Failures are counted
-- in two independent windows:
--   by email - stops one account being ground down
--   by IP    - stops one host spraying many accounts
--
-- Rows are pruned automatically by the application, so this table
-- stays small. It is not an audit log of donors and holds no health
-- data - only an email address, an IP, and a timestamp.
-- ============================================================

USE `blood_donor_system`;

CREATE TABLE IF NOT EXISTS `login_attempts` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,

    -- The email as TYPED, not a foreign key: attempts against accounts
    -- that do not exist are exactly what a spray looks like, and those
    -- must be counted too.
    `email` VARCHAR(255) NOT NULL,

    -- 45 chars so an IPv6 address fits.
    `ip_address` VARCHAR(45) NOT NULL,

    `successful` TINYINT(1) NOT NULL DEFAULT 0,
    `attempted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Both lookups are "failures for X since T", so the timestamp is
    -- part of each index rather than a separate one.
    INDEX `idx_attempt_email` (`email`, `attempted_at`),
    INDEX `idx_attempt_ip` (`ip_address`, `attempted_at`),
    INDEX `idx_attempt_time` (`attempted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- IF YOU LOCK YOURSELF OUT
-- ============================================================
-- The lockout is time-based and clears on its own. To clear it now:
--
--   DELETE FROM login_attempts WHERE email = 'you@example.com';
--
-- or, to clear everything:
--
--   TRUNCATE TABLE login_attempts;
-- ============================================================
