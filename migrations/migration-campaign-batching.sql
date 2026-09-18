-- ============================================================
-- Migration: campaign id for batched sending
-- Version: 1.6
-- Run this ONCE against an existing blood_donor_system database.
-- Fresh installs get this automatically from database.sql.
--
-- WHY
--   Sending was a single synchronous loop: one HTTP call per
--   recipient, each with a 20-second cURL timeout, inside one web
--   request. At 488 donors even 300ms per call is about 2.5 minutes,
--   against PHP's default 30-second max_execution_time. The request
--   died part-way through: some donors received the message, some did
--   not, and the operator saw no summary at all.
--
--   Worse, re-running to "finish the job" started again from the
--   beginning and messaged everyone who had already received it.
--
--   Sending is now done in chunks, and each run carries a campaign id.
--   A recipient already logged as Sent under that id is skipped, so a
--   retry resumes instead of repeating.
--
-- Guarded so the migration can be re-run; MySQL has no
-- "ADD COLUMN IF NOT EXISTS".
-- ============================================================

USE `blood_donor_system`;

SET @col_exists = (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'message_logs'
      AND COLUMN_NAME  = 'campaign_id'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE `message_logs`
        ADD COLUMN `campaign_id` CHAR(32) DEFAULT NULL AFTER `staff_id`,
        ADD INDEX `idx_campaign` (`campaign_id`, `status`)',
    'SELECT "message_logs.campaign_id already exists" AS note'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- The index is (campaign_id, status) rather than campaign_id alone
-- because every lookup is "was this recipient already Sent in this
-- campaign", which filters on both columns together.
