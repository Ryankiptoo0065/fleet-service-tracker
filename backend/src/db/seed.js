// src/db/seed.js
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { pool, ready } = require("./database");

async function seed() {
  await ready;
  console.log("Seeding database...");

  const adminPass = bcrypt.hashSync("admin123", 10);
  const driverPass = bcrypt.hashSync("driver123", 10);

  await pool.query(
    `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO NOTHING`,
    ["Fleet Admin", "admin@example.com", adminPass, "admin"],
  );
  await pool.query(
    `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO NOTHING`,
    ["John Driver", "john@example.com", driverPass, "driver"],
  );
  await pool.query(
    `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO NOTHING`,
    ["Mary Driver", "mary@example.com", driverPass, "driver"],
  );

  const john = (
    await pool.query("SELECT id FROM users WHERE email = $1", [
      "john@example.com",
    ])
  ).rows[0];
  const mary = (
    await pool.query("SELECT id FROM users WHERE email = $1", [
      "mary@example.com",
    ])
  ).rows[0];

  await pool.query(
    `INSERT INTO vehicles (plate_number, make, model, year, assigned_driver_id, current_odometer_km, last_service_odometer_km, service_interval_km)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (plate_number) DO NOTHING`,
    ["KDA 123A", "Toyota", "Hiace", 2019, john.id, 48500, 45000, 5000],
  );
  await pool.query(
    `INSERT INTO vehicles (plate_number, make, model, year, assigned_driver_id, current_odometer_km, last_service_odometer_km, service_interval_km)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (plate_number) DO NOTHING`,
    ["KDB 456B", "Isuzu", "NQR", 2021, mary.id, 32000, 30000, 8000],
  );
  await pool.query(
    `INSERT INTO vehicles (plate_number, make, model, year, assigned_driver_id, current_odometer_km, last_service_odometer_km, service_interval_km)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (plate_number) DO NOTHING`,
    ["KDC 789C", "Toyota", "Hilux", 2020, null, 61000, 60500, 6000],
  );

  console.log("Seed complete.");
  console.log("Login as admin: admin@example.com / admin123");
  console.log("Login as driver: john@example.com / driver123");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
