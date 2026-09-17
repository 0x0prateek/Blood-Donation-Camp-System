-- ============================================================
-- Migration: schema migration ledger
-- Version: 1.7
-- Run this ONCE. It is the bootstrap for scripts/migrate.php.
--
-- WHY
--   There are seven migration-*.sql files and, until now, nothing
--   recording which had been applied. That is not a theoretical gap:
--   a restore of an old dump silently rolled this database backwards
--   twice, and both times the only symptom was a page going blank.
--   Working out what was missing meant diffing the live schema
--   against database.sql by hand.
--
--   With this table, "which schema version is this database?" has an
--   answer you can read, and re-running a migration that is not safe
--   to re-run becomes impossible rather than merely inadvisable.
--
--   That matters here: migration-whatsapp-templates.sql uses a plain
--   ALTER TABLE ADD COLUMN with no guard, so running it twice fails.
--
-- USAGE (see scripts/migrate.php)
--   php scripts/migrate.php status     what is applied, what is pending
--   php scripts/migrate.php baseline   record existing files as applied
--   php scripts/migrate.php migrate    apply everything pending
-- ============================================================

USE `blood_donor_system`;

CREATE TABLE IF NOT EXISTS `schema_migrations` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,

    -- The filename is the identity. UNIQUE so the same migration can
    -- never be recorded twice.
    `filename` VARCHAR(255) NOT NULL UNIQUE,

    -- SHA-256 of the file when it was applied. If the file changes
    -- afterwards, the runner can say so - an edited migration means the
    -- database and the repository no longer agree, which is precisely
    -- the situation that is otherwise invisible.
    `checksum` CHAR(64) NOT NULL,

    `applied_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 'applied'  - the runner executed it
    -- 'baseline' - recorded as already present without being run, used
    --              once when adopting the ledger on an existing database
    `method` ENUM('applied','baseline') NOT NULL DEFAULT 'applied',

    INDEX `idx_migration_applied` (`applied_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
