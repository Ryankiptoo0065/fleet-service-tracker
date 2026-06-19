// src/routes/dashboard.js
const express = require('express');
const { pool } = require('../db/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/summary', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM vehicles WHERE owner_id = $1', [req.user.id]);
    const vehicles = result.rows;

    let dueCount = 0;
    let dueSoonCount = 0;
    const dueVehicles = [];

    for (const v of vehicles) {
      const kmSinceService = v.current_odometer_km - v.last_service_odometer_km;
      const kmUntilDue = v.service_interval_km - kmSinceService;
      if (kmUntilDue <= 0) {
        dueCount++;
        dueVehicles.push({ id: v.id, plate_number: v.plate_number, km_overdue: -kmUntilDue });
      } else if (kmUntilDue <= v.service_interval_km * 0.1) {
        dueSoonCount++;
      }
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) AS c FROM service_records sr
       JOIN vehicles v ON v.id = sr.vehicle_id
       WHERE v.owner_id = $1`,
      [req.user.id]
    );
    const costResult = await pool.query(
      `SELECT SUM(sr.cost) AS total FROM service_records sr
       JOIN vehicles v ON v.id = sr.vehicle_id
       WHERE v.owner_id = $1`,
      [req.user.id]
    );

    res.json({
      total_vehicles: vehicles.length,
      active_vehicles: vehicles.filter((v) => v.status === 'active').length,
      in_service_vehicles: vehicles.filter((v) => v.status === 'in_service').length,
      due_for_service: dueCount,
      due_soon: dueSoonCount,
      due_vehicles: dueVehicles,
      total_service_records: parseInt(countResult.rows[0].c, 10),
      total_service_cost: parseFloat(costResult.rows[0].total) || 0,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
