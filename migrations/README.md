# Database Migrations

These SQL files upgrade an existing `blood_donor_system` database. They are
separate from `database/01-setup.sql`, which initializes a fresh container.

Apply a migration with an administrative database account, for example:

```bash
mysql -u root -p blood_donor_system < migrations/migration-user-portal.sql
```

Review each file before applying it. The application database user must not
have schema-altering privileges. The active application does not load these
files automatically.