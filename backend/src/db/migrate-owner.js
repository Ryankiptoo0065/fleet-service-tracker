// One-time migration script: assigns any vehicles with NULL owner_id to the admin user.
// Run this once after deploying the owner_id schema change, then you can delete this file.
require('dotenv').config();
const { pool, ready } = require('./database');

async function migrate() {
  await ready;
  console.log('Checking for vehicles without an owner...');

  const orphans = await pool.query('SELECT id, plate_number FROM vehicles WHERE owner_id IS NULL');
  if (orphans.rows.length === 0) {
    console.log('No orphaned vehicles found. Nothing to do.');
    process.exit(0);
  }

  console.log(`Found ${orphans.rows.length} vehicle(s) without an owner:`, orphans.rows.map(v => v.plate_number));

  const admin = await pool.query("SELECT id FROM users WHERE email = 'admin@example.com'");
  if (!admin.rows[0]) {
    console.log('No admin@example.com user found - cannot assign ownership automatically.');
    process.exit(1);
  }

  await pool.query('UPDATE vehicles SET owner_id = $1 WHERE owner_id IS NULL', [admin.rows[0].id]);
  console.log(`Assigned ${orphans.rows.length} vehicle(s) to admin@example.com.`);

  // Now make owner_id required going forward
  await pool.query('ALTER TABLE vehicles ALTER COLUMN owner_id SET NOT NULL');
  console.log('owner_id is now required for all vehicles.');

  process.exit(0);
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
