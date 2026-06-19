// src/routes/vehicles.js
// Every vehicle belongs to the user who created it (owner_id).
// All queries are scoped to req.user.id so each user only ever sees their own fleet.
const express = require('express');
const { pool } = require('../db/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

function withServiceStatus(vehicle) {
  const kmSinceService = vehicle.current_odometer_km - vehicle.last_service_odometer_km;
  const kmUntilDue = vehicle.service_interval_km - kmSinceService;
  return {
    ...vehicle,
    km_since_last_service: kmSinceService,
    km_until_service_due: kmUntilDue,
    is_service_due: kmUntilDue <= 0,
    is_service_due_soon: kmUntilDue > 0 && kmUntilDue <= vehicle.service_interval_km * 0.1,
  };
}

router.get('/', async (req, res, next) => {
  try {
    const { status, due } = req.query;
    const result = await pool.query(
      'SELECT * FROM vehicles WHERE owner_id = $1 ORDER BY plate_number',
      [req.user.id]
    );
    let rows = result.rows.map(withServiceStatus);

    if (status) rows = rows.filter((v) => v.status === status);
    if (due === 'true') rows = rows.filter((v) => v.is_service_due);

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const vResult = await pool.query(
      'SELECT * FROM vehicles WHERE id = $1 AND owner_id = $2',
      [req.params.id, req.user.id]
    );
    const vehicle = vResult.rows[0];
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

    const odometerLogs = await pool.query(
      `SELECT ol.*, u.name AS logged_by_name
       FROM odometer_logs ol
       LEFT JOIN users u ON u.id = ol.logged_by_user_id
       WHERE ol.vehicle_id = $1
       ORDER BY ol.logged_at DESC LIMIT 50`,
      [req.params.id]
    );

    const serviceRecords = await pool.query(
      `SELECT sr.*, u.name AS serviced_by_name
       FROM service_records sr
       LEFT JOIN users u ON u.id = sr.serviced_by_user_id
       WHERE sr.vehicle_id = $1
       ORDER BY sr.service_date DESC`,
      [req.params.id]
    );

    res.json({
      ...withServiceStatus(vehicle),
      odometer_logs: odometerLogs.rows,
      service_records: serviceRecords.rows,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const {
      plate_number,
      make,
      model,
      year,
      assigned_driver_id,
      current_odometer_km,
      service_interval_km,
    } = req.body;

    if (!plate_number) {
      return res.status(400).json({ error: 'plate_number is required' });
    }

    const result = await pool.query(
      `INSERT INTO vehicles
       (owner_id, plate_number, make, model, year, assigned_driver_id, current_odometer_km, last_service_odometer_km, service_interval_km)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $7, $8)
       RETURNING *`,
      [
        req.user.id,
        plate_number,
        make || null,
        model || null,
        year || null,
        assigned_driver_id || null,
        current_odometer_km || 0,
        service_interval_km || 5000,
      ]
    );

    res.status(201).json(withServiceStatus(result.rows[0]));
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'You already have a vehicle with that plate number' });
    }
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const existing = await pool.query(
      'SELECT * FROM vehicles WHERE id = $1 AND owner_id = $2',
      [req.params.id, req.user.id]
    );
    if (!existing.rows[0]) return res.status(404).json({ error: 'Vehicle not found' });

    const fields = [
      'plate_number',
      'make',
      'model',
      'year',
      'assigned_driver_id',
      'service_interval_km',
      'status',
    ];
    const updates = [];
    const values = [];
    let i = 1;
    for (const field of fields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = $${i}`);
        values.push(req.body[field]);
        i++;
      }
    }
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields provided to update' });
    }

    values.push(req.params.id, req.user.id);
    const result = await pool.query(
      `UPDATE vehicles SET ${updates.join(', ')} WHERE id = $${i} AND owner_id = $${i + 1} RETURNING *`,
      values
    );

    res.json(withServiceStatus(result.rows[0]));
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(
      'DELETE FROM vehicles WHERE id = $1 AND owner_id = $2',
      [req.params.id, req.user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Vehicle not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.post('/:id/odometer', async (req, res, next) => {
  try {
    const { reading_km, note } = req.body;
    const vResult = await pool.query(
      'SELECT * FROM vehicles WHERE id = $1 AND owner_id = $2',
      [req.params.id, req.user.id]
    );
    const vehicle = vResult.rows[0];
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

    if (typeof reading_km !== 'number' || reading_km < 0) {
      return res.status(400).json({ error: 'reading_km must be a non-negative number' });
    }
    if (reading_km < vehicle.current_odometer_km) {
      return res.status(400).json({
        error: `reading_km (${reading_km}) cannot be less than the current recorded odometer (${vehicle.current_odometer_km})`,
      });
    }

    await pool.query(
      'INSERT INTO odometer_logs (vehicle_id, reading_km, logged_by_user_id, note) VALUES ($1, $2, $3, $4)',
      [req.params.id, reading_km, req.user.id, note || null]
    );

    const updated = await pool.query(
      'UPDATE vehicles SET current_odometer_km = $1 WHERE id = $2 AND owner_id = $3 RETURNING *',
      [reading_km, req.params.id, req.user.id]
    );

    res.status(201).json(withServiceStatus(updated.rows[0]));
  } catch (err) {
    next(err);
  }
});

router.post('/:id/service', async (req, res, next) => {
  try {
    const { odometer_km, service_type, description, cost, garage_name, service_date } = req.body;
    const vResult = await pool.query(
      'SELECT * FROM vehicles WHERE id = $1 AND owner_id = $2',
      [req.params.id, req.user.id]
    );
    const vehicle = vResult.rows[0];
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

    if (!service_type) {
      return res.status(400).json({ error: 'service_type is required (e.g. "Oil change")' });
    }
    const odo = typeof odometer_km === 'number' ? odometer_km : vehicle.current_odometer_km;

    await pool.query(
      `INSERT INTO service_records
       (vehicle_id, odometer_km, service_type, description, cost, garage_name, serviced_by_user_id, service_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, NOW()))`,
      [
        req.params.id,
        odo,
        service_type,
        description || null,
        cost || null,
        garage_name || null,
        req.user.id,
        service_date || null,
      ]
    );

    const updated = await pool.query(
      `UPDATE vehicles
       SET last_service_odometer_km = $1,
           current_odometer_km = GREATEST(current_odometer_km, $1)
       WHERE id = $2 AND owner_id = $3
       RETURNING *`,
      [odo, req.params.id, req.user.id]
    );

    res.status(201).json(withServiceStatus(updated.rows[0]));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
