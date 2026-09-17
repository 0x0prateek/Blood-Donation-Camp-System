# Blood Donor Management System

A full-stack Blood Donor Management System for blood donation organizations — manage donors, blood camps, finances, messaging (WhatsApp + SMS), and reports.

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
- MariaDB 10.11

---

## 📁 Project Structure

```
Blood-Donation-Camp-System/
├── backend/          ← Node.js Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── index.js
│   ├── package.json
│   └── Dockerfile
├── frontend/         ← Vue 3 SPA
│   ├── src/
│   │   ├── views/    ← One per page
│   │   ├── components/
│   │   ├── stores/   ← Pinia (auth, settings)
│   │   ├── api/      ← Axios instance
│   │   └── router/
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
├── railway.json
└── database.sql      ← Full schema + seed data
```

---

## 🚀 Quick Start (Docker / Podman)

### Prerequisites
- Podman 4+ (with `podman-compose` or `podman compose`)
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
| Frontend (Vue SPA) | http://localhost |
| Backend API | http://localhost:8080/api |
| Database | localhost:3306 |

### 4. Set the admin password

The database seeds a locked admin account (`admin@admin.com`). You must set a password before first login.

Connect to the database and run:
```sql
-- Replace <hash> with the output of the command below
UPDATE admins SET password = '<hash>' WHERE email = 'admin@admin.com';
```

Generate the hash:
```bash
docker compose exec backend node -e "require('bcrypt').hash('your_password', 10).then(console.log)"
```

Alternatively, to run the apps locally without containers (make sure your `.env` connects to a running MySQL instance):

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

---

## 🚂 Deploy to Railway.app

Railway runs each service as a separate deployment. The quickest path:

### Option A — Railway CLI (recommended)

```bash
npm install -g @railway/cli
railway login
railway init           # creates a new Railway project
railway up             # deploys from Dockerfile
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

All routes are prefixed `/api`. Authentication via JWT in `httpOnly` cookie set at login.

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user |
| GET | `/api/dashboard` | Dashboard stats |
| GET | `/api/donors` | Paginated donor list |
| POST | `/api/donors` | Create donor |
| GET | `/api/donors/{id}` | Get donor |
| PUT | `/api/donors/{id}` | Update donor |
| DELETE | `/api/donors/{id}` | Delete donor |
| GET | `/api/donors/export` | Excel export |
| POST | `/api/donors/import` | Excel import |
| GET | `/api/camps` | Camp list |
| GET | `/api/camps/{id}/registrations` | Camp registrations |
| GET | `/api/camps/{id}/finance` | Finance summary |
| POST | `/api/messages/sms` | Send SMS (chunked) |
| POST | `/api/messages/whatsapp` | Send WhatsApp (chunked) |
| GET | `/api/settings` | All settings |
| GET | `/api/health` | Health check |

See the source for the full route list.

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
- SQL injection prevention via PDO prepared statements
- Excel import size-capped at 5 MB (memory-exhaustion mitigation)

---

## 📝 License

MIT — see [LICENSE](LICENSE)
