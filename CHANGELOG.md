# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- `database/05-demo-portal-data.sql` with 120 donor-portal users and 120
  blood-group requests for repeatable admin workflow testing.
- Admin blood-request filtering/status management and donor request history.
- Service-specific Railway configuration for the backend and frontend, with a
  build-time `VITE_API_BASE` so separate Railway services can communicate.
- Dedicated `migrations/` directory and migration documentation.
- `database/04-bulk-dummy-data.sql` - a large, realistic demo dataset (150 donors, 12 staff, 14 additional camps, 200+ camp-register entries, camp finance records across 6 camps, 100+ message-log rows) for exercising pagination, filters, charts and reports with production-scale volumes instead of the original 5-donor/3-camp seed.
- `GET /api/public/stats` - a new unauthenticated endpoint returning aggregate, non-identifying counts (active donors, camps, confirmed donations, blood groups covered) for the public landing page. Never returns donor names or mobiles.
- Full redesign of the public landing page (`Landing.vue`): replaced the gamified "1 million donor campaign" mock-up (fake countdown timer, static donor count, no real content) with a professional site - hero with live platform stats, a features grid covering every admin module, a "how it works" register-desk workflow, a live impact section backed by `/api/public/stats`, a security/stack trust section, and a proper footer.
- Custom favicon and app icon: a blood-drop + heartbeat mark (`frontend/public/favicon.svg`, plus PNG fallbacks for `apple-touch-icon` and legacy favicon sizes), replacing the default Vite icon. Page `<title>` updated to "DotLife | Blood Donation Camp System".
- Complete migration of the frontend from PHP server-rendered pages to a Vue 3 Single Page Application (SPA).
- Implemented state management using Pinia for authentication and global settings.
- Migrated legacy chunked-sending logic (for WhatsApp and SMS) directly into Vue components (`Messages.vue`, `Emergency.vue`) to ensure bulk messages don't time out.
- Implemented Chart.js integrations natively in Vue via `vue-chartjs` on the Dashboard and Reports views.
- Node.js backend completely replicates legacy PHP functionalities including Excel exports, messaging logic, and Camp Registration/Finance.
- Added comprehensive local `docker-compose.yml` and `.env` scaffolding.

### Changed
- Replaced backend framework from PHP to Node.js 20 (Express).
- Modified `.env.example` to point to `http://localhost:3000` and `db` for out-of-the-box Docker compose support.
- Updated `README.md` to reflect the move to Node.js/Vue3 and updated security sections.
- Moved frontend Docker container to port 3000 and backend to port 8081 to avoid local port conflicts.

### Fixed
- Fixed Nginx routing issue where `proxy_pass` trailing slash was stripping the `/api/` prefix, causing 404s on all backend routes.
- Corrected frontend API calls for authentication to correctly hit `/api/auth/me` and `/api/auth/logout`.
- Full pre-deployment audit of the Vue 3 / Node / MySQL rewrite, fixing request/response contract mismatches left over from the PHP-to-Node migration:
  - Camp Finance (`/api/finance/contributions|expenses/list`) never returned the `summary`/`by_category` aggregates the Finance page reads, so the budget dashboard was always blank; both endpoints now compute them server-side. `/api/finance/export` was a `501 Not Implemented` stub - now generates a real 3-sheet Excel/CSV export.
  - Camp Finance category and payment-method values on the frontend (`Water & Beverages`, `Cheque`, etc.) didn't match the database `ENUM` values, so most contribution/expense saves failed - frontend option lists now match the schema exactly.
  - `/api/reports/export` referenced a non-existent column (`cr.donation_status` instead of `cr.status`) and crashed on every request; now fixed and extended to generate the 4 distinct report types the Reports page links to.
  - Excel donor import (`/api/donors/import`) used `worksheet.eachRow(async ...)`, whose callback is never awaited by ExcelJS, so the response was sent with wrong (usually zero) imported/skipped counts before rows finished processing. Rows are now collected first and processed in an awaited loop.
  - Bulk WhatsApp/SMS sending (`/api/messages/send-whatsapp|sms`) read `target` while the frontend sent `recipient_type`, so every send from the Messages and Emergency pages failed with "Invalid target". WhatsApp template sends also never mapped a template's variable order onto Meta's `{{1}},{{2}}...` placeholders (only the recipient's name was ever sent); this is now implemented, plus a new "message selected donors" send path.
  - Settings page "Test WhatsApp"/"Test SMS" buttons posted a different field shape (`action`, `test_phone`, ...) than `/api/settings/save` read (`test`, `test_mobile`), so tests silently did nothing and, worse, wrote those extra fields into the `settings` table as junk rows. The save endpoint now branches correctly on the actual request shape.
  - `donors.js`'s and `templates.js`'s last route (`/blood-group-counts`, `/sync`) were declared after `module.exports = router` - functionally harmless (Node executes the whole module body before `require()` returns) but fragile; reordered.
  - Added a missing `GET /api/donors/:id` endpoint - the Edit Donor page was calling the paginated `/donors/list` endpoint and silently loading a blank form.
  - Donors and Staff list pages used a Laravel-style pagination contract (`response.data.meta.*`) the backend never implements (it returns DataTables-style `{draw, recordsTotal, recordsFiltered, data}`), so search, blood-group/status filters and pagination beyond the first page did nothing; both pages and their backend routes now share one consistent contract.
  - Camp Register page's blood-group/status filters and its "Registered/Donated/Rejected" summary cards were wired to fields/response keys the backend never read or returned; fixed on both sides, and the register-lookup endpoint now returns the `state` (`new_donor`/`known_donor`/`already_registered`) the UI's walk-in flow depends on.
  - `JWT_EXPIRY_HOURS` was defined in `.env`/`docker-compose.yml` but never read - the session length was hardcoded to 24h regardless. Now honoured for both the JWT `expiresIn` and the cookie's `maxAge`.
  - `authStore.login()`/`checkAuth()` and the Settings page's account loader read `response.data.user` instead of `response.data.data.user`, so the signed-in admin's name/email never actually populated in the UI.
  - Several admin pages linked to `/donors`, `/donors/add`, `/donors/:id/edit` and `/camps` instead of the router's actual `/admin/...` paths - dead links.
  - `docker-compose.prod.yml` built the backend with `target: production`, a stage that didn't exist in `backend/Dockerfile` (single-stage) - a production build failed outright. `backend/Dockerfile` is now multi-stage with a matching `production` target.
  - Fresh-install seed data (`database/03-more-dummy-data.sql`) inserted `message_logs` rows referencing donor ids that don't exist in `database/02-dummy-data.sql`, violating the table's foreign key on every clean install.

### Added
- Twilio SMS gateway is now actually implemented (`backend/src/utils/messaging.js`) - previously selecting it in Settings returned "not implemented in Node yet" regardless of credentials.
- `database/01-setup.sql` now seeds the three Sinhala message templates on a fresh install (previously only available via the standalone `migration-sinhala-templates.sql`, so a Docker/Podman fresh install never had them).
- `backend/src/index.js`: a catch-all 404 JSON handler for `/api/*` and a last-resort error-handling middleware that never leaks stack traces to the client (only when `APP_DEBUG=true`).
- `OLD_SYSTEM_PHP/archive/PPTx/Blood_Donation_Camp_System_Presentation.pptx` - a project-overview slide deck covering architecture, stack, database design, security and deployment.

### Security
- Login now enforces brute-force throttling (5 failed attempts per email / 20 per IP within 15 minutes) using the previously-unused `login_attempts` table.
- `/api/auth/account-save` now requires the current password to change the admin's name, email or password - previously an authenticated request could change any of them with no re-authentication.
- Login sets `sameSite: 'lax'` on the auth cookie.

### Removed
- Entire legacy `OLD_SYSTEM_PHP` codebase is now fully decoupled and safely ignored from the Git repository.
