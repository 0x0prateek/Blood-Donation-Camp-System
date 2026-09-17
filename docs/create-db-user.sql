-- ============================================================
-- Least-privilege database user
--
-- WHY: the application previously connected as MySQL root with an
-- empty password, hardcoded in a file committed to a public GitHub
-- repository. Under root, any SQL flaw, file disclosure or config
-- leak becomes total database compromise - including DROP - and the
-- application can silently rewrite its own schema.
--
-- The user below can read and change ROWS in this one schema. It
-- cannot create or drop tables, cannot touch other databases, and
-- cannot grant anything to anyone.
--
-- HOW TO USE
--   1. Choose a long random password. Do NOT reuse one.
--   2. Replace CHANGE_ME_BEFORE_RUNNING below, in both places.
--   3. Run as root:  mysql -u root < docs/create-db-user.sql
--   4. Put the same password in config.local.php (git-ignored).
--   5. Verify with the checks at the bottom of this file.
--
-- Claude did not choose or set this password: credentials are yours
-- to create, and a password written into a chat transcript is not a
-- secret any more.
-- ============================================================

-- Application user. 'localhost' assumes the web server and MySQL are
-- on the same machine - the usual shared-hosting arrangement. If the
-- database is on another host, replace 'localhost' with the web
-- server's address rather than using '%'.
CREATE USER IF NOT EXISTS 'bdms_app'@'localhost'
    IDENTIFIED BY 'CHANGE_ME_BEFORE_RUNNING';

-- Row-level access only. Deliberately NOT granted:
--   CREATE, ALTER, DROP  - schema changes are a migration job, run
--                          separately as an admin user
--   GRANT OPTION         - so a compromise cannot escalate
--   FILE                 - so a compromise cannot read server files
GRANT SELECT, INSERT, UPDATE, DELETE
    ON `blood_donor_system`.*
    TO 'bdms_app'@'localhost';

-- ── Optional: a separate read-only user for backups ──────────
-- mysqldump needs only SELECT, plus LOCK TABLES for a consistent
-- dump. Keeping backups on their own account means the backup job
-- cannot modify anything even if the script is tampered with.
CREATE USER IF NOT EXISTS 'bdms_backup'@'localhost'
    IDENTIFIED BY 'CHANGE_ME_BEFORE_RUNNING';

GRANT SELECT, LOCK TABLES, SHOW VIEW, EVENT, TRIGGER
    ON `blood_donor_system`.*
    TO 'bdms_backup'@'localhost';

FLUSH PRIVILEGES;

-- ============================================================
-- VERIFY - run these after creating the user
-- ============================================================
-- Should list only the grants above, and nothing on *.*:
--   SHOW GRANTS FOR 'bdms_app'@'localhost';
--
-- Should SUCCEED (normal application work):
--   mysql -u bdms_app -p blood_donor_system -e "SELECT COUNT(*) FROM donors;"
--
-- Should FAIL with "command denied" - this is the point of the change:
--   mysql -u bdms_app -p blood_donor_system -e "DROP TABLE donors;"
--   mysql -u bdms_app -p -e "SHOW DATABASES;"        -- sees only its own
--
-- ============================================================
-- NOTE ON MIGRATIONS
-- ============================================================
-- Because bdms_app cannot ALTER or CREATE, the migration-*.sql files
-- must be run as an administrative user, not by the application:
--   mysql -u root < migration-staff.sql
-- This is intentional. An application that cannot change its own
-- schema also cannot have its schema changed by an attacker who
-- reaches it.
