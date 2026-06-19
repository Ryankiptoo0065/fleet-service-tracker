# FleetTrack — Vehicle Service Tracker

A full-stack web app for tracking vehicle service schedules in a company fleet.
Drivers log odometer readings; the system flags when a vehicle is due for service.

## Features
- 🚛 **Vehicle registry** — plate, make, model, year, driver assignment
- 📍 **Odometer logging** — drivers log mileage after each trip
- 🔧 **Service records** — log what was done, at what mileage, cost, garage
- ⚠️ **Auto-alerts** — vehicles flagged when they hit their service interval
- 📊 **Dashboard** — fleet-wide overview at a glance
- 🔐 **Auth** — JWT-based login, admin vs driver roles

---

## Quick start

### 1. Backend (API server)

```bash
cd backend

# Copy and edit environment config
cp .env.example .env
# Open .env and change JWT_SECRET to a long random string

# Install dependencies
npm install

# Set up the database and load sample data
npm run seed

# Start the API server
npm start
# → running on http://localhost:4000
```

### 2. Frontend (React app)

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
# → opens on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Demo accounts (after running `npm run seed`)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| Driver | john@example.com | driver123 |
| Driver | mary@example.com | driver123 |

---

## API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | — | Register |
| POST | /api/auth/login | — | Login |
| GET | /api/dashboard/summary | ✓ | Fleet overview stats |
| GET | /api/vehicles | ✓ | List all vehicles |
| POST | /api/vehicles | Admin | Add vehicle |
| GET | /api/vehicles/:id | ✓ | Vehicle + logs + history |
| PUT | /api/vehicles/:id | Admin | Edit vehicle |
| DELETE | /api/vehicles/:id | Admin | Remove vehicle |
| POST | /api/vehicles/:id/odometer | ✓ | Log a mileage reading |
| POST | /api/vehicles/:id/service | ✓ | Record a service event |

---

## Migrating to PostgreSQL

When you're ready to deploy with Postgres:

1. Replace `better-sqlite3` with `pg`
2. Rewrite `src/db/database.js` to use a `pg.Pool` connection
3. Add `PGCONNECTIONSTRING` to your `.env`
4. Minor SQL tweaks: `INTEGER PRIMARY KEY AUTOINCREMENT` → `SERIAL PRIMARY KEY`, `datetime('now')` → `NOW()`

---

## Project structure

```
backend/
├── src/
│   ├── server.js           Entry point
│   ├── db/
│   │   ├── database.js     SQLite setup + schema
│   │   └── seed.js         Sample data
│   ├── middleware/
│   │   └── auth.js         JWT middleware
│   └── routes/
│       ├── auth.js
│       ├── vehicles.js
│       └── dashboard.js
└── data/fleet.db           Auto-created on first run

frontend/
├── src/
│   ├── App.jsx             Router + auth guard
│   ├── AuthContext.jsx     Global auth state
│   ├── index.css           Design system
│   ├── api/client.js       All API calls
│   ├── components/
│   │   ├── AppShell.jsx    Sidebar nav
│   │   ├── ServiceBadge.jsx
│   │   └── AddVehicleModal.jsx
│   └── pages/
│       ├── LoginPage.jsx
│       ├── DashboardPage.jsx
│       ├── VehiclesPage.jsx
│       └── VehicleDetailPage.jsx
```
