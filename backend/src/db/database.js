// src/db/database.js
// PostgreSQL connection (via Supabase or any Postgres host).
// Requires DATABASE_URL in .env, e.g:
// DATABASE_URL=postgresql://user:pass@host:5432/dbname

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // required for Supabase
});

async function initSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'driver' CHECK (role IN ('admin', 'driver')),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS vehicles (
      id SERIAL PRIMARY KEY,
      plate_number TEXT UNIQUE NOT NULL,
      make TEXT,
      model TEXT,
      year INTEGER,
      assigned_driver_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      current_odometer_km REAL NOT NULL DEFAULT 0,
      last_service_odometer_km REAL NOT NULL DEFAULT 0,
      service_interval_km REAL NOT NULL DEFAULT 5000,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'in_service', 'retired')),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS odometer_logs (
      id SERIAL PRIMARY KEY,
      vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
      reading_km REAL NOT NULL,
      logged_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      note TEXT,
      logged_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS service_records (
      id SERIAL PRIMARY KEY,
      vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
      odometer_km REAL NOT NULL,
      service_type TEXT NOT NULL,
      description TEXT,
      cost REAL,
      garage_name TEXT,
      serviced_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      service_date TIMESTAMP DEFAULT NOW(),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_odometer_logs_vehicle ON odometer_logs(vehicle_id);
    CREATE INDEX IF NOT EXISTS idx_service_records_vehicle ON service_records(vehicle_id);
  `);
}

const ready = initSchema().catch((err) => {
  console.error('Failed to initialize schema:', err);
  throw err;
});

module.exports = { pool, ready };
