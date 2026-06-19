// src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ready } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

ready
  .then(() => {
    const authRoutes = require('./routes/auth');
    const vehicleRoutes = require('./routes/vehicles');
    const dashboardRoutes = require('./routes/dashboard');

    app.use('/api/auth', authRoutes);
    app.use('/api/vehicles', vehicleRoutes);
    app.use('/api/dashboard', dashboardRoutes);

    app.use((err, req, res, next) => {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    });

    app.listen(PORT, () => {
      console.log(`Fleet Service Tracker API running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
