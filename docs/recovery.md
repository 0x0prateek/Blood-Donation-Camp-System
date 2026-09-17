# Recovery procedures

Operational runbook for the situations that lock you out or lose data.

Keep a copy of this **somewhere other than this system** — printed, or in a
password manager. A recovery guide that lives only inside the thing you cannot
get into is not a recovery guide.

All commands assume you are in the project root. On XAMPP for Windows, replace
`mysql` with `C:\xampp\mysql\bin\mysql.exe` and `php` with `C:\xampp\php\php.exe`.

---

## 1. Forgotten administrator password

**There is deliberately no "forgot password" flow.** A self-service reset on a
single-admin system holding donor health records is a bigger risk than the
inconvenience it removes — it would add an email-based path into the only
account that exists.

Recovery requires database access.

Generate a hash **without putting the password in your shell history** — this
waits for you to type it, then prints the hash:

```bash
php -r "echo password_hash(trim(fgets(STDIN)), PASSWORD_DEFAULT), PHP_EOL;"
```

Apply it:

```sql
UPDATE admins
   SET password = '<paste-the-hash>'
 WHERE email = 'your@email.example';
```

Then sign in and confirm the change on Settings → Admin Account.

> Do not paste a plaintext password into a `php -r "...'mypassword'..."`
> one-liner. It goes into your shell history and, on a shared host, into the
> process list where any other user can read it.

---

## 2. Locked out by the login throttle

Five failed attempts for one email, or twenty from one IP, within fifteen
minutes triggers a lockout. **It clears itself** — wait fifteen minutes.

To clear it immediately:

```sql
DELETE FROM login_attempts WHERE email = 'your@email.example';
```

Or everything:

```sql
TRUNCATE TABLE login_attempts;
```

A successful login already clears that account's failures automatically.

---

## 3. Restoring the database

**This is where this project has actually lost data.** A dump was restored
twice; both times it reported success and silently rolled the schema backwards,
dropping tables and columns that the code depended on. The only symptom was a
page going blank, because errors were being discarded rather than logged.

**Never restore a dump onto live data without verifying it first.**

```bash
# 1. Back up what you have NOW, even if you think it is broken
./scripts/backup.sh

# 2. Verify the dump you intend to restore. This restores into a
#    throwaway database, checks the schema and data, then drops it.
#    Your live database is not touched.
./scripts/verify-restore.sh backups/blood_donor_system-YYYYMMDD-HHMMSS-schemaXXXXXXXX.sql.gz

# 3. Only if that says RESTORE VERIFIED:
gunzip -c backups/<file>.sql.gz | mysql -u root

# 4. Re-apply any migrations the dump predates
php scripts/migrate.php status
php scripts/migrate.php migrate
```

Step 4 is not optional. The backup filename carries a schema fingerprint and
the dump contains the `schema_migrations` ledger, so `verify-restore.sh` will
tell you if it is behind — but only the migrate step fixes it.

### After any restore, re-check

Restores also revert **settings**, not just schema. Both incidents wiped the
SMS credentials and reverted the gateway to Twilio:

```sql
SELECT setting_key, IF(setting_value = '', '>>> EMPTY <<<', setting_value)
  FROM settings
 WHERE setting_key LIKE 'sms%' OR setting_key LIKE 'whatsapp%';
```

Re-enter the Notify.lk API key on Settings → SMS Gateway. It is the one value
nothing else can restore for you.

---

## 4. Files deleted or the server lost

Application code lives in git. The things git does **not** hold:

| What | Where it lives | If lost |
|---|---|---|
| Database | `backups/*.sql.gz` | Restore per §3 |
| `config.local.php` | The server only — git-ignored | Recreate from `config.local.php.example`; you need the DB password |
| Notify.lk API key | Your Notify.lk account | Retrieve from their settings page |
| Uploaded spreadsheets | `storage/uploads` | Transient; deleted after import |

Rebuild:

```bash
git clone <repo> && cd Blood-Donation-Camp-System
cp config.local.php.example config.local.php   # then fill it in
mysql -u root < database.sql
php scripts/migrate.php baseline
```

---

## 5. A migration was applied but the file changed

```bash
php scripts/migrate.php status
```

Exit code `2`, with `*** FILE CHANGED SINCE APPLIED ***`, means the database
and the repository no longer describe the same schema. Someone edited a
migration after it ran. Work out which is correct before deploying — do not
simply re-run it. Several migrations are not safe to run twice.

---

## 6. Escalation checklist

Before asking anyone for help, gather:

- `php scripts/migrate.php status`
- The last 50 lines of `storage/logs/php-error.log`
- Output of `./scripts/verify-restore.sh` against your most recent backup
- Whether `config.local.php` exists on the server

Those four answer most questions immediately. The error log in particular
exists precisely because its absence once turned a missing column into an
unexplained blank page.
