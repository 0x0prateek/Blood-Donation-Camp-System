# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Complete migration of the frontend from PHP server-rendered pages to a Vue 3 Single Page Application (SPA).
- Implemented state management using Pinia for authentication and global settings.
- Migrated legacy chunked-sending logic (for WhatsApp and SMS) directly into Vue components (`Messages.vue`, `Emergency.vue`) to ensure bulk messages don't time out.
- Implemented Chart.js integrations natively in Vue via `vue-chartjs` on the Dashboard and Reports views.
- Node.js backend completely replicates legacy PHP functionalities including Excel exports, messaging logic, and Camp Registration/Finance.
- Added comprehensive local `docker-compose.yml` and `.env` scaffolding.

### Changed
- Replaced backend framework from PHP to Node.js 20 (Express).
- Modified `.env.example` to point to `http://localhost` and `db` for out-of-the-box Docker compose support.
- Updated `README.md` to reflect the move to Node.js/Vue3 and updated security sections.

### Removed
- Entire legacy `OLD_SYSTEM_PHP` codebase is now fully decoupled and safely ignored from the Git repository.
