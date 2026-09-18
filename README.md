# Blood Donor Management System

A full-stack Blood Donor Management System (Demo Learning Project for Students) for blood donation organizations — manage donors, blood camps, finances, messaging (WhatsApp + SMS), and reports.

**Stack:** Vue 3 SPA + Node.js (Express) REST API + MySQL — fully containerised (Docker/Podman OCI), deployable to Railway.app.

---

## 🛠 Technology Stack

### Backend
- Node.js 20 + Express (REST API)
- `mysql2` (MySQL/MariaDB promises)
- JWT authentication (httpOnly cookies) & `bcrypt`
- `exceljs` (Excel import/export)
- WhatsApp Cloud API (Meta) + Notify.lk / Twilio (SMS)

### Frontend
- Vue 3 (Composition API, `<script setup>`)
- Vite + Vue Router 4 + Pinia
- Bootstrap 5.3
- Axios, Chart.js, SweetAlert2
- Font Awesome 6

### Infrastructure
- Docker / Podman (OCI-compliant)
- Docker Compose v2
```
Blood-Donation-Camp-System/
├── backend/          ← Node.js Express API
│   ├── src/
│   │   ├── config/     ← MySQL pool (db.js)
│   │   ├── middleware/ ← JWT auth guard
│   │   ├── routes/     ← One file per resource (auth, donors, camps, ...)
│   │   ├── utils/      ← functions.js, messaging.js (WhatsApp/SMS gateways)
│   │   └── index.js
│   ├── package.json
│   └── Dockerfile      ← multi-stage: default + `production` target
├── frontend/         ← Vue 3 SPA
│   ├── src/
│   │   ├── views/      ← One per page (Donors/, Camps/, Communication/, ...)
│   │   ├── stores/     ← Pinia (auth, settings)
│   │   ├── plugins/    ← axios.js (API client)
│   │   ├── layouts/    ← AppLayout.vue (admin shell)
│   │   └── router/
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
├── railway.json
├── database/          ← SQL run on first container boot, in order
│   ├── 01-setup.sql          (schema + seed data)
│   ├── 02-dummy-data.sql     (demo donors/camps)
│   ├── 03-more-dummy-data.sql
│   ├── 04-bulk-dummy-data.sql  (150 donors, 14 camps, registrations, finance, messages - for UI load testing)
│   └── 05-demo-portal-data.sql (120 donor users and 120 blood requests)
├── migrations/       ← Standalone database upgrades, applied in filename order
└── OLD_SYSTEM_PHP/   ← Archived PHP application and non-runtime project artifacts
```

---

## 🚀 Quick Start (Docker / Podman)

### Prerequisites
- macOS users: Install Colima to run the Docker engine: `brew install colima && colima start`
- Podman 4+, plus a compose provider: `podman compose` (built in on newer
  Podman) or `pip install podman-compose` if you see
  `Error: looking up compose provider failed`
- Or Docker 24+

### 1. Clone & configure

```bash
git clone https://github.com/0x0prateek/Blood-Donation-Camp-System.git
cd Blood-Donation-Camp-System
cp .env.example .env
# Edit .env — set strong passwords, JWT_SECRET, and messaging credentials
```

### 2. Build & run

**Using Podman (Recommended):**
```bash
# Make sure your podman machine is initialized and running:
# podman machine init && podman machine start

podman compose up --build
```

**Using Docker:**
```bash
docker compose up --build
```

### 3. Open the app

| Service | URL |
|---|---|
| Frontend (Vue SPA) | http://localhost:3000 |
| Backend API | http://localhost:8081/api |
| Database | localhost:3306 |


**Start the Backend:**
```bash
cd backend
npm install
npm start
```

**Start the Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Existing database upgrade

If the database was created before the donor portal was added, apply the user
portal migration before using donor registration or blood inquiries:

```bash
mysql -u root -p blood_donor_system < migrations/migration-user-portal.sql
```

For the optional development dataset, apply the portal seed after the schema
exists:

```bash
mysql -u root -p blood_donor_system < database/05-demo-portal-data.sql
```

The seed creates 120 portal users and 120 specific blood-group requests for
admin workflow testing. Every seeded portal user uses `password123`.

---

## 🚂 Deploy to Railway.app

Railway runs each service as a separate deployment. The quickest path:

### Railway service setup

Create three Railway services in the same project:

1. Add a Railway MySQL plugin.
2. Create a backend service from the repository root. The root
  [railway.json](railway.json) and [Dockerfile](Dockerfile) explicitly select
  Docker mode and build `backend/` for `/api/health`.
3. Create a frontend service with root directory `frontend/`. Its service
  config is [frontend/railway.json](frontend/railway.json) and its Dockerfile
  is `frontend/Dockerfile`.
4. Set the frontend variable `VITE_API_BASE` to the public backend URL plus
  `/api`, for example `https://dotlife-api.up.railway.app/api`.
5. Set the backend variable `FRONTEND_URL` to the public frontend URL.

Railway builds the services independently. The root deployment is the backend
API; the frontend deployment uses `VITE_API_BASE`
for direct production API calls, while local Docker Compose continues to use
the internal `/api` Nginx proxy.

For the backend service, set `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`,
`JWT_SECRET`, and `FRONTEND_URL` in Railway Variables. Map the Railway MySQL
plugin variables as shown below. Do not deploy the root as a Railpack Node
application; the committed root Dockerfile is the intended build path.

### Option A — Railway CLI (recommended)

```bash
npm install -g @railway/cli
railway login
railway init           # creates a new Railway project
# Run `railway up` from backend/ and frontend/ separately,
# after linking each directory to its Railway service.
```

Set environment variables in the Railway dashboard → **Variables** tab for each service. Use the same keys from `.env.example`.

### Option B — GitHub integration

1. Push this repo to GitHub
2. In Railway: **New Project → Deploy from GitHub repo**
3. Add two services: point one at `./backend` (Dockerfile) and one at `./frontend` (Dockerfile)
4. Add a **MySQL plugin** service
5. Set env vars in each service's Variables tab
6. Railway injects `MYSQL_URL` automatically from the plugin — map it to `DB_HOST`, `DB_USER`, etc.

### Railway env var mapping

| Railway MySQL Plugin var | Our var |
|---|---|
| `MYSQLHOST` | `DB_HOST` |
| `MYSQLDATABASE` | `DB_NAME` |
| `MYSQLUSER` | `DB_USER` |
| `MYSQLPASSWORD` | `DB_PASS` |

Set `FRONTEND_URL` on the backend service to the Railway URL of your frontend service, e.g. `https://blood-donor-frontend.up.railway.app`.

---

## 🔌 API Reference

All routes are prefixed `/api`. Authentication via JWT in an `httpOnly` cookie set at login.
List/search endpoints use a DataTables-style contract - `POST .../list` with
`{ draw, start, length, search: { value }, order: [{ column, dir }], ...filters }`,
returning `{ draw, recordsTotal, recordsFiltered, data }` (plus `summary`/`by_category`
where noted).

| Method | Path | Description |
|---|---|---|
| GET | `/api/public/stats` | Public, unauthenticated aggregate stats (used by the landing page) |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user |
| POST | `/api/auth/account-save` | Change name/email/password (requires current password) |
| POST | `/api/donors/list` | Paginated, searchable donor list |
| POST | `/api/donors/save` | Create/update donor (`id` present = update) |
| POST | `/api/donors/delete` | Delete donor |
| POST | `/api/donors/status` | Toggle Active/Inactive |
| GET | `/api/donors/:id` | Get one donor |
| GET | `/api/donors/export` | Excel export |
| POST | `/api/donors/import` | Excel import |
| GET | `/api/donors/blood-group-counts` | Active donor counts per blood group |
| POST | `/api/camps/list` \| `/save` \| `/delete` \| `/budget-save` | Camp CRUD + budget |
| POST | `/api/registrations/list` \| `/lookup` \| `/save` \| `/delete` | Camp register (list returns a `summary`; lookup returns donor `state`) |
| GET | `/api/registrations/export` | Register export (xlsx/csv) |
| POST | `/api/finance/contributions/list` \| `/save` \| `/delete` | Camp donations (list returns `summary` + `by_category`) |
| POST | `/api/finance/expenses/list` \| `/save` \| `/delete` | Camp expenses (list returns `summary` + `by_category`) |
| GET | `/api/finance/export` | Finance export (xlsx 3-sheet, or csv per `section`) |
| POST | `/api/staff/list` \| `/save` \| `/delete` | Organising-committee CRUD |
| POST | `/api/templates/list` \| `/save` \| `/delete` \| `/sync` | Message templates (`/sync` pulls approved templates from Meta) |
| POST | `/api/messages/send-whatsapp` \| `/send-sms` | Chunked bulk send (call repeatedly with `offset` until `done`) |
| POST | `/api/messages/log` | Message history |
| GET | `/api/settings/load` | All settings |
| POST | `/api/settings/save` | Save settings, or run a test send (`action: 'test_whatsapp'\|'test_sms'`) |
| GET | `/api/reports/dashboard` | Dashboard stats |
| POST | `/api/reports/data` | Filtered report data |
| GET | `/api/reports/export` | Report export (`report=summary\|blood_groups\|messages\|eligible`) |
| GET | `/api/health` | Health check |

See the source under `backend/src/routes/` for the full, current route list.

---

## 💬 Messaging Setup

### WhatsApp (Meta Cloud API)
1. Create a Meta Business account at [developers.facebook.com](https://developers.facebook.com)
2. Create a WhatsApp Business App and get your **Phone Number ID** and **Access Token**
3. Add to `.env`: `WHATSAPP_API_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`
4. Submit message templates for approval in WhatsApp Manager
5. Add templates in the app → Templates page

### SMS
**Notify.lk:**
- Set `SMS_GATEWAY=notify`
- `SMS_API_KEY` = User ID, `SMS_API_SECRET` = API Key, `SMS_SENDER_ID` = approved sender name

**Twilio:**
- Set `SMS_GATEWAY=twilio`
- `SMS_API_KEY` = Account SID, `SMS_API_SECRET` = Auth Token, `SMS_SENDER_ID` = Twilio number

---

## 🩺 Features

- **Donor Management** — Full CRUD, Excel import/export, blood group filter, eligibility tracking
- **Blood Camps** — Schedule camps, track status (Upcoming/Completed/Cancelled)
- **Camp Register** — Digital attendance book, mobile lookup, donation status per donor
- **Budget & Donations** — Track contributions (cash + in-kind) and expenses per camp
- **Staff Management** — Organising committee members
- **Messaging** — Bulk WhatsApp & SMS with chunked sending (handles 500+ donors without timeout), campaign deduplication
- **Templates** — Reusable message templates with WhatsApp approval integration
- **Emergency Alerts** — Quick blood group targeted alerts
- **Reports** — Donation analytics with date range filtering and Excel export
- **Settings** — App config, messaging credentials, admin account management

---

## 🔒 Security

- JWT authentication with httpOnly cookies (XSS-resistant)
- Login rate limiting (5 failures per 15 minutes per email, 20 per IP)
- CORS restricted to configured `FRONTEND_URL`
- SQL injection prevention via parameterized queries (`mysql2/promise`)
- Excel import size-capped at 5 MB (memory-exhaustion mitigation)

---

## 📝 License

MIT — see [LICENSE](LICENSE)
