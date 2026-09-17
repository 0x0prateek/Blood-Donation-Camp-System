# Blood Donor Management System — Task Tracker

## Phase 1: Core Infrastructure
- [x] Database SQL schema
- [x] config.php
- [x] composer.json
- [x] .htaccess
- [x] includes/db.php
- [x] includes/auth.php
- [x] includes/functions.php
- [x] includes/header.php
- [x] includes/footer.php

## Phase 2: Assets
- [x] assets/css/style.css
- [x] assets/js/app.js

## Phase 3: Authentication
- [x] login.php
- [x] logout.php
- [x] index.php
- [x] ajax/login.php

## Phase 4: Dashboard
- [x] admin/dashboard.php

## Phase 5: Donor Management
- [x] admin/donors.php
- [x] admin/donor-add.php
- [x] admin/donor-edit.php
- [x] ajax/donor-save.php
- [x] ajax/donor-delete.php
- [x] ajax/donor-list.php
- [x] ajax/donor-status.php
- [x] ajax/donor-import.php
- [x] ajax/donor-export.php

## Phase 6: Blood Camp Management
- [x] admin/camps.php
- [x] ajax/camp-save.php
- [x] ajax/camp-delete.php
- [x] ajax/camp-list.php

## Phase 7: Messaging Module
- [x] admin/messages.php
- [x] admin/templates.php
- [x] admin/emergency.php
- [x] ajax/send-whatsapp.php
- [x] ajax/send-sms.php
- [x] ajax/message-log.php
- [x] ajax/template-save.php
- [x] ajax/template-delete.php
- [x] ajax/template-list.php

## Phase 8: Reports
- [x] admin/reports.php
- [x] ajax/report-data.php
- [x] ajax/report-export.php

## Phase 9: Settings
- [x] admin/settings.php
- [x] ajax/settings-save.php

## Phase 10: Verification
- [x] PHP syntax check all files
- [x] Browser test
- [x] Composer install

## Phase 11: Camp Register (attendance by T.P. number)
The T.P. (mobile) number is the unique identifier for a person, matching
the paper register book. `donors`.`mobile` was already UNIQUE, so no
change to the donors table was needed.

- [x] migration-camp-register.sql (`camp_registrations` table)
- [x] database.sql updated for fresh installs
- [x] `normalizeMobile()` + `findDonorByMobile()` in includes/functions.php
- [x] ajax/registration-lookup.php (T.P. -> known donor / walk-in / already in)
- [x] ajax/registration-save.php (mark in, quick-add walk-ins, edit)
- [x] ajax/registration-list.php (server-side DataTable + per-camp tallies)
- [x] ajax/registration-delete.php
- [x] ajax/registration-export.php (Excel/CSV laid out like the book)
- [x] admin/camp-register.php (register desk UI)
- [x] Nav link + per-camp "Register" button on admin/camps.php
- [x] Tested: duplicate T.P. blocked across formats, serial numbering,
      Sinhala text, "Donated" stamps donor's last donation date

## Phase 12: Bug Fixes
- [x] config.php re-entry guard - Composer's `autoload.files` re-included
      config.php with a plain `require`, bypassing `require_once`. The
      resulting "Constant already defined" warnings were being written
      into binary downloads, corrupting every Excel export
      (donor-export, report-export, registration-export).
- [x] donor-import.php now uses normalizeMobile(), so an imported T.P.
      matches what the camp register stores (previously a "+94..." import
      would not match a "07..." lookup and silently created a duplicate).
- [x] donor-import.php rejects names that arrive as literal "?" - the
      signature of a CSV re-saved in the Windows ANSI codepage, which
      cannot represent Sinhala.

## Phase 13: Historical Data Entry
- [x] 73 register photos rotated upright (originals are sideways)
- [x] Pages 1-8 transcribed -> parts/p01-p08 + supplement
- [x] Pages 53-54 transcribed -> parts/p53, p54
- [x] 488 donors imported and verified (0 mangled, 0 malformed T.P.)
- [ ] Pages 9-52: fragment CSVs were never committed and are lost. The
      DONOR DATA itself is safe in the database (see donors-backup CSV);
      only the per-page working files are gone.
- [ ] Pages 55-73: not yet transcribed (~19 pages)
- [ ] ~150 no-blood-group contacts from pages 1-52 need re-transcribing

## Phase 14: Data Loss Incident (2026-08-15) - RESOLVED
Commit 915d091 "Delete blood-doner-details directory" removed 160 files.
Recovered from git history:
- [x] 73 original photos restored (4000x2252, 194.9 MB)
- [x] parts/p01-p08 + supplement + PROGRESS.md restored
- [x] Backup copies kept at Documents\blood-donor-images-backup\
- [x] 10 donor names destroyed by an Excel CSV round-trip, repaired from
      source fragments (repair-mangled-names.php)
- [x] 10 fabricated "O+" blood groups cleared back to blank

## Phase 15: WhatsApp Template Support
WhatsApp only delivers free-form text inside the 24-hour window opened
when a donor messages first. Announcing a camp is business-initiated and
must use a template Meta approved in advance, so the sender now supports
both modes.

- [x] migration-whatsapp-templates.sql - adds whatsapp_template_name,
      whatsapp_language, whatsapp_variables to message_templates
- [x] database.sql updated for fresh installs
- [x] buildTemplatePayload() maps named placeholders ({NAME}, {DATE}...)
      onto Meta's numbered {{1}},{{2}},... via the variable order
- [x] send-whatsapp.php sends either a template or free text; blank
      parameters are replaced with "-" because Meta rejects empty ones
- [x] Templates page captures the Meta template name, language and
      variable order, validated (lowercase/underscore names only)
- [x] Messages page: delivery-mode toggle, warns that free text only
      reaches donors who replied within 24h, blocks sending a template
      that has no Meta name set
- [x] Settings "Test WhatsApp" now sends the pre-approved `hello_world`
      template instead of free text, so it works as a real smoke test,
      and explains 401 / recipient-allowlist / missing-template errors
- [x] Tested: payload shape, variable ordering, Sinhala parameters,
      static templates, and all endpoint validation paths

## Phase 16: Bug Fixes
- [x] **config.php: APP_DEBUG set to `false`** - was leaking database
      errors and stack traces to whoever triggered them

## Phase 17: Admin Account Management
- [x] ajax/account-save.php - change display name, login email, password
- [x] Current password required for ANY change on the card, so an
      unlocked browser cannot be used to take the account over
- [x] Password rules: min 10 chars, must match confirmation, must differ
      from the current one; email must stay unique
- [x] session_regenerate_id(true) on password change, so a stolen
      session id stops working
- [x] Settings page shows a warning while still on admin@admin.com
- [x] Tested: 6 rejection paths, name/email-only save leaves the hash
      untouched, password change verified through the real login endpoint
      (new password works, old one refused)

## Phase 18: Bug Fixes (round 2)
- [x] **donor-save.php did not normalise the T.P. number.** A donor added
      by hand as "070 000 0000" was stored with the spaces, so the camp
      register's "0700000000" lookup missed and created a second copy of
      the same person. The Add/Edit form now normalises mobile and
      WhatsApp, and duplicate detection catches the same person entered
      as 077..., +94... or with spaces.
- [x] **emergency.php would have failed outright** - it posted to the
      WhatsApp sender without send_mode/template_id, and template is now
      the default. Added a template picker (Emergency Request first),
      client-side guards, and it passes send_mode. This was a regression
      introduced by the Phase 15 template work.
- [x] **report-data.php returned a 9th, nameless blood group** for the
      donors whose group was never recorded, which would have rendered as
      a blank pie slice. Chart is back to the eight real groups and the
      unknowns are reported as summary.unknown_blood_group.
- [x] **saveSetting() left a stale value in getSetting()'s static cache**,
      so a setting read back later in the same request was the old one.
- [x] **donor-status.php reported "Donor not found"** when a donor was set
      to the status they already had, because MySQL returns 0 affected
      rows for a no-op UPDATE. Existence is now checked separately.

## Phase 19: Bug Fixes (round 3)
- [x] **Settings test button broke on a real number.** The test sent
      Meta's `hello_world`, which is only allowed from Meta's public test
      numbers - once the org's own number was registered it failed with
      error 131058. The test panel now has a template picker listing the
      templates configured on the Templates page, and 131058 / missing
      template / missing payment errors are explained in plain words.
      (Regression from Phase 15.)
- [x] **Settings page rendered secrets into the page HTML.** The WhatsApp
      token and SMS secret were output as input values, so the live token
      was readable in View Source, DevTools, and anything that scraped the
      page. Both fields now render empty with a "saved" hint, and a blank
      box on save means "keep the stored value" rather than erasing it.

## Phase 19b: Settings page fatal error
- [x] The WhatsApp test-template picker called `$db->query()`, but
      settings.php never defines `$db` (it uses getSetting() helpers).
      That fatal killed the page mid-render, so Save Settings, Test
      WhatsApp, Test SMS and Update Account all vanished. Changed to
      getDB()->query(). All 11 admin pages now render fully with no
      errors - checked by rendering each one.

## Phase 20: OUTSTANDING (historical - superseded by Phase 31)
Kept for the record. Current status of each item:

- [x] **Set your own admin email + password** - done 2026-09-04. Account is
      no longer the seeded admin@admin.com, which no longer exists, and
      the published default password is rejected by the login endpoint.
- [ ] Create and get approval for the actual WhatsApp templates in
      WhatsApp Manager - still outstanding, see Phase 31
- [ ] Saved WhatsApp token is only 32 characters - still outstanding
- [x] Decide whether blood-doner-details/ belongs in git - decided: no.
      A .gitignore now excludes it along with uploads/, backups/ and dumps.
- [ ] Pages 55-73 / no-blood-group contacts - partly addressed: 335 more
      donors were imported 2026-09-04, but 344 of the 823 still have no
      blood group. See Phase 30.
- [x] No automated tests - a zero-dependency suite now exists, see Phase 32
- [x] SMS not implemented - Notify.lk is live and sending, see Phase 23.
      Dialog and Mobitel remain deliberately unimplemented.

## Phase 21: Camp Budget, Donations and Expenses
People bring food, soft drinks and water bottles to a camp for the
donors, and the organisers spend money running it. Both are now tracked
per camp, but deliberately kept apart: donated GOODS are reported at an
estimated value on their own line and never folded into the cash
balance, because a hundred water bottles are not money the treasurer
can spend.

- [x] migration-camp-finance.sql - `camp_contributions`, `camp_expenses`,
      `blood_camps.budget_amount`, `currency_symbol` setting. The column
      add is guarded through information_schema so the file can be re-run
      (MySQL has no "ADD COLUMN IF NOT EXISTS")
- [x] database.sql updated for fresh installs
- [x] functions.php: formatMoney(), getCampFinanceSummary(),
      campContributionCategories(), campExpenseCategories(),
      campPaymentMethods(), contributionCategoryIcon()
- [x] admin/camp-finance.php - camp selector, six live money cards,
      budget planner with a paid/committed progress bar, and two tabs:
      Donations Received and Expenses
- [x] Contribution form changes shape by category: Cash wants an exact
      amount and hides the item lines; goods want an item, quantity and
      unit with only an optional estimated value
- [x] ajax/contribution-{save,list,delete}.php
- [x] ajax/expense-{save,list,delete}.php
- [x] ajax/camp-budget-save.php - blank box clears the budget rather than
      storing zero, so "no budget planned" stays distinct from "budgeted
      nothing"
- [x] ajax/camp-finance-export.php - three-sheet Excel workbook (Summary,
      Contributions, Expenses) or single-section CSV with a BOM so Excel
      reads Sinhala names
- [x] camps.php: Planned Budget field on the camp modal and a per-camp
      budget button on each row; camp-save.php persists it
- [x] Settings > General: Currency Symbol (defaults to Rs.)
- [x] Sidebar: "Budget & Donations" under Management
- [x] Tested end to end against the live database: every save, update,
      delete and validation path, the summary arithmetic, the filtered
      lists, and the exported workbook read back sheet by sheet. Test
      rows were removed afterwards - the tables ship empty.
## Phase 22: Bug Fixes (round 4)
- [x] **Every positive blood group rendered invisible.** The badge rules
      were written as `.badge-blood.A\+, .badge-blood[data-blood="A+"]`.
      In CSS `+` is the adjacent-sibling combinator, so the class half
      was an invalid selector - and one invalid selector in a
      comma-separated list voids the entire rule, taking the working
      attribute selector down with it. A+, B+, AB+ and O+ therefore had
      no background at all, and since `.badge-blood` sets `color: #fff`
      they were white text on a white table. The negative groups were
      unaffected, because an escaped `-` is a legal class character - so
      the bug hid on the ~4% of donors who are Rh-negative while
      affecting 460 of 489 records. Confirmed in the browser: only 5 of
      the 9 rules were being parsed. Class selectors removed (the markup
      only ever used `data-blood`), and `.badge-blood` now carries a
      neutral fallback background so no badge can go white-on-white again.
- [x] Donors table and the Reports eligible-donor list now show a dash
      for the ~10 donors transcribed with no blood group, instead of an
      empty badge.

## Phase 23: Notify.lk SMS gateway
Twilio does not serve Sri Lankan numbers economically and cannot carry
Sinhala without cost. Notify.lk replaces it.

- [x] No client library, deliberately. notifylk/notify-php returns
      `[null, $statusCode, $httpHeader]` from sendSMSWithHttpInfo(),
      discarding the response body - and that body is the only place
      Notify says whether a message was accepted. The whole API is one
      form-encoded POST, so it is called directly.
- [x] Success is decided by the DECODED BODY, not the HTTP status.
      Notify answers 200 with `{"status":"error"}` for a rejected send,
      so status-code checking alone would log failures as successes.
- [x] Field errors arrive as `{"errors":[...]}`, not a message string.
      Reading only message/error replaced the real reason ("The api key
      field must be 20 characters.") with a generic one.
- [x] `type=unicode` set only when the message is non-ASCII. Notify
      defaults to GSM-7, which has no Sinhala - messages arrived as a
      row of "?". UCS-2 carries 70 characters per segment instead of
      160, so forcing it on English would roughly double its cost.
      The check runs on the RENDERED body, so a Sinhala donor name in
      an English template correctly flips that message too.
- [x] Length capped with mb_strlen, not strlen: a Sinhala message is
      multi-byte and byte-counting rejected valid messages at a third
      of Notify's 320-character limit.
- [x] Settings: Notify.lk added to the gateway dropdown AND to the
      server-side whitelist in settings-save.php. Missing the second
      silently rewrote the gateway back to twilio on every save, so
      Notify credentials were posted to Twilio and rejected.

## Phase 24: Staff (camp organising committee)
- [x] migration-staff.sql - `staff` table, plus `message_logs.staff_id`
      because donor_id has a foreign key into donors and cannot hold a
      staff id. A log row belongs to one or the other, never both.
- [x] admin/staff.php and ajax/staff-{save,list,delete}.php
- [x] Staff are a recipient option on Messages and Emergency, wired for
      both channels - chunking one sender and not the other would have
      made the client re-send the whole list on every chunk.
- [x] Mobile must be 07... A committee member exists to be messaged, so
      a landline is a guaranteed silent failure the night before a camp.
      Donors keep the looser rule.
- [x] Deleting a staff member keeps their message history: the foreign
      key is ON DELETE SET NULL, so the audit trail survives.

## Phase 25: Sinhala message templates
- [x] migration-sinhala-templates.sql - Sinhala versions of all three
      templates, alongside the English ones rather than replacing them.
- [x] They reuse the same whatsapp_template_name with language `si`,
      which is Meta's own model: one template name, one approved
      version per language.
- [x] Verified through the app's PDO connection, not just the mysql
      client: valid UTF-8, zero literal "?", placeholders intact as
      Latin capitals, and rendering with real Sinhala values leaves no
      unresolved tokens.
- [x] Cost recorded: the two long Sinhala templates are 3 SMS segments
      each against 1 for their English equivalents.

## Phase 26: Pre-production audit
- [x] Full security, database, performance, dependency and reliability
      audit before first deployment. Scored 40/100 - NOT READY.
- [x] Findings that were REAL and reproduced live: .git downloadable
      over HTTP, MySQL root with an empty password, the seeded admin
      still active, an open redirect via the Host header, no
      brute-force protection, errors discarded rather than logged,
      three HIGH CVEs in PhpSpreadsheet, stored XSS in 14 DataTables
      columns, and no backups of any kind.
- [x] Findings that were checked and came back CLEAN: no SQL injection
      in any of 75 queries, CSRF on every state-changing endpoint,
      auth on every page and endpoint, bcrypt, session regeneration on
      login, no dangerous functions.
- [x] One audit finding was WRONG and is corrected here: BUG-07 called
      ezyang/htmlpurifier a dead dependency to remove. It is a hard
      require of phpspreadsheet. Removing it would break composer.

## Phase 27: Security hardening, part 1
- [x] .htaccess blocks dotfiles and dot-directories. The FilesMatch
      rules match EXTENSIONS, and .git internals have none, so
      /.git/config returned 200 - enough to reconstruct the repository
      and its history including deleted donor photographs.
- [x] Credentials moved to config.local.php (git-ignored);
      docs/create-db-user.sql holds the GRANT statements for a
      least-privilege user, with the password left as a placeholder.
- [x] APP_CANONICAL_HOST pins the hostname. BASE_URL was built from
      the client-supplied Host header, so a request carrying
      "Host: evil.example.com" produced redirects and asset URLs
      pointing there.
- [x] error_reporting(E_ALL) with display_errors off and log_errors on.
      The previous error_reporting(0) does not merely hide errors, it
      stops them being generated, so nothing reached a log either -
      which is why a missing database column presented as a blank page.
- [x] session.cookie_secure under HTTPS, and a two-hour idle timeout
      that finally reads the login_time that was being recorded and
      never used.
- [x] composer.phar untracked and denied; uploads moved out of the web
      root with random filenames and a 5 MB cap.
- [x] **Mistake made and caught:** `php_flag engine off` was added at
      the app root intending it for uploads only. It disabled PHP
      across the whole application and Apache began serving .php files
      as PLAIN TEXT - a worse disclosure than the one being fixed.
      Caught by a browser check; curl's 200 responses had not revealed
      it. A comment in .htaccess now says why it must never go there.

## Phase 28: Security hardening, part 2
- [x] 14 DataTables columns across six pages now use
      `$.fn.dataTable.render.text()`. Reproduced in a browser first:
      the unescaped column genuinely executed an onerror payload.
- [x] login_attempts table and throttling - 5 failures per email and
      20 per IP in 15 minutes. Runs BEFORE the password check, and the
      lockout message is identical whether or not the account exists so
      it cannot be used to enumerate accounts. X-Forwarded-For is
      deliberately not trusted: it is attacker-controlled and would let
      anyone reset their own limit.
- [x] Bulk sending chunked with a campaign id. One outbound call per
      recipient could not finish inside max_execution_time for 488
      donors: the request died part-way, some donors received the
      message, and re-running messaged everyone again. A recipient
      already logged Sent under that campaign is skipped; a Failed one
      is retried.
- [x] dataTablePaging() - DataTables sends length=-1 for "All", and
      "LIMIT -1" is a SQL syntax error. Two endpoints clamped it and
      five did not, which is what keeping the rule in seven places
      produces.
- [x] Subresource Integrity on all 15 CDN assets; sweetalert2 pinned
      from a floating @11 to 11.26.25. Google Fonts deliberately
      excluded - its CSS varies by user agent, so a pinned hash would
      break the page.

## Phase 29: Maintainability
- [x] schema_migrations ledger and scripts/migrate.php with
      status / baseline / migrate / rehash. Exit 0 clean, 1 pending,
      2 an applied migration has been EDITED since it ran - the last
      being otherwise completely invisible, and the situation that
      rolled this database backwards twice.
- [x] Checksums normalise line endings. Hashing raw bytes made every
      migration report itself as edited straight after being committed,
      because git stores LF and checks out CRLF on Windows. A checker
      that cries wolf is one nobody reads.
- [x] includes/messaging.php - one implementation per provider. The
      Twilio routine existed twice byte-for-byte, once for real sends
      and once for the Settings test, so a passing test guaranteed
      nothing about real sends.
- [x] emergency.php: eight COUNT queries in a loop replaced by one
      GROUP BY, verified to produce identical figures.
- [x] CSRF applied to the eight list endpoints. The four EXPORT
      endpoints are deliberately left out and each says why: they are
      plain GET navigations that send no token, and putting one in the
      query string would leak it into history, referrers and logs.
- [x] docs/recovery.md - password recovery (there is deliberately no
      self-service reset), clearing a lockout, restoring safely, and
      what git does not hold.

## Phase 30: Donor import and backups
- [x] 335 donors imported from an external dump, taking the roll from
      488 to 823. The dump was NOT restored: it contained only 9 tables
      and would have rolled the schema back past Phases 24-29 for a
      third time. Donors were extracted into a throwaway database and
      inserted through normalizeMobile().
- [x] Verified after import: 823 distinct mobiles for 823 rows, zero
      duplicates, zero mangled names, 321 Sinhala names read back
      intact through the application's own connection.
- [x] "Not recorded" blood group filter. 344 of 823 donors have no
      blood group - the largest single category - and the dropdown
      offered no way to list them. The clause is shared with the export,
      because the export buttons send whatever the page filter is set
      to and only one of them understanding it would have quietly
      exported all 823.
- [x] Addresses are searchable. The register books are organised by
      village, so a village name is what somebody types; it returned
      nothing and now returns 60 matches.
- [x] Nightly backup scheduled 02:15 via Task Scheduler, verified by
      triggering it and restoring the result into a throwaway database.
- [x] PhpSpreadsheet upgraded to 1.30.6, clearing three HIGH CVEs.
      The 512-byte OLE stub that drove OLERead.php to a 264 MB
      allocation and a fatal now throws cleanly at 6 MB. The Phase 27
      mitigations were KEPT on top rather than reverted.

## Phase 31: OUTSTANDING

Blocks production:
- [ ] **Create the least-privilege database user.** config.local.php
      does not exist and no bdms_* user exists, so the application
      still connects as MySQL root with an empty password. Everything
      else sits on top of this. docs/create-db-user.sql is ready; only
      you can choose the password.
- [ ] **Set APP_CANONICAL_HOST** in the same file once the production
      hostname is known. Until then the open-redirect fix is inert.
- [ ] **Confirm .htaccess is honoured on the production host.** Every
      file protection depends on it. On nginx, or Apache with
      AllowOverride None, none of it applies and config.php becomes
      readable. Test: requesting /.git/HEAD must not return 200.

Blocks real messaging:
- [ ] Sender ID is still NotifyDEMO. Needs an approved name of at most
      11 characters - the organisation's full name is 27 and no carrier
      will deliver it.
- [ ] Three WhatsApp templates need approving in WhatsApp Manager, in
      both en and si.
- [ ] WhatsApp number registration still fails. The test number under
      "Step 1. Try it out" is the low-risk way back in.
- [ ] The saved WhatsApp token is 32 characters - a placeholder. Real
      Meta tokens start "EAA" and run 200+.

Operational:
- [ ] Move backups off this disk. Archives currently sit on the same
      drive as the database they protect.
- [ ] Point the backup at bdms_backup once it exists, with the password
      in a MySQL option file - never an environment variable, where the
      process list exposes it.
- [ ] Cost-check before the first camp blast: 823 recipients, and
      Sinhala names flip even English templates to three segments.

Data:
- [ ] 344 donors have no blood group. Use the new filter: search a
      village, set "Not recorded", work the list.
- [ ] Two landline records (ids 411, 416) will fail on every send.

## Phase 32: Automated tests
- [x] tests/run.php - a zero-dependency runner. PHPUnit was considered
      and rejected: vendor/ is tracked in this repository, so adding it
      would commit thousands of files for a suite this size, and the
      project uses no framework anywhere else.
- [x] Covers the pure logic behind the bugs that actually happened:
      mobile normalisation, DataTables paging, the blood group filter,
      campaign ids, placeholder rendering, SMS segment and encoding
      rules, output escaping, lockout wording and gateway setup hints.
      Migration checksums are NOT covered: scripts/migrate.php is a
      script that would execute on require, so it cannot be loaded
      into the suite without refactoring it first.
- [x] No database and no network, so it runs anywhere and cannot
      damage data. Run with: php tests/run.php
