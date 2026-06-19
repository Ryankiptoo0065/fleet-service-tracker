// src/db/seed.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool, ready } = require('./database');

async function seed() {
  await ready;
  console.log('Seeding database...');

  const adminPass = bcrypt.hashSync('admin123', 10);
  const driverPass = bcrypt.hashSync('driver123', 10);

  await pool.query(
    `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO NOTHING`,
    ['Fleet Admin', 'admin@example.com', adminPass, 'admin']
  );
  await pool.query(
    `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO NOTHING`,
    ['John Driver', 'john@example.com', driverPass, 'driver']
  );

  const admin = (await pool.query('SELECT id FROM users WHERE email = $1', ['admin@example.com'])).rows[0];

  // Demo vehicles belong to the admin account only.
  // New users who register will start with zero vehicles, by design.
  await pool.query(
    `INSERT INTO vehicles (owner_id, plate_number, make, model, year, current_odometer_km, last_service_odometer_km, service_interval_km)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (owner_id, plate_number) DO NOTHING`,
    [admin.id, 'KDA 123A', 'Toyota', 'Hiace', 2019, 48500, 45000, 5000]
  );
  await pool.query(
    `INSERT INTO vehicles (owner_id, plate_number, make, model, year, current_odometer_km, last_service_odometer_km, service_interval_km)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (owner_id, plate_number) DO NOTHING`,
    [admin.id, 'KDB 456B', 'Isuzu', 'NQR', 2021, 32000, 30000, 8000]
  );
  await pool.query(
    `INSERT INTO vehicles (owner_id, plate_number, make, model, year, current_odometer_km, last_service_odometer_km, service_interval_km)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (owner_id, plate_number) DO NOTHING`,
    [admin.id, 'KDC 789C', 'Toyota', 'Hilux', 2020, 61000, 60500, 6000]
  );

  console.log('Seed complete.');
  console.log('Admin (has 3 demo vehicles): admin@example.com / admin123');
  console.log('Driver (starts with 0 vehicles): john@example.com / driver123');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
