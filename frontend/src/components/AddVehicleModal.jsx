// src/components/AddVehicleModal.jsx
import { useState } from 'react';
import { api } from '../api/client';

export function AddVehicleModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    plate_number: '',
    make: '',
    model: '',
    year: '',
    current_odometer_km: '',
    service_interval_km: '5000',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.plate_number.trim()) {
      setError('Plate number is required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const vehicle = await api.createVehicle({
        ...form,
        year: form.year ? parseInt(form.year) : undefined,
        current_odometer_km: form.current_odometer_km ? parseFloat(form.current_odometer_km) : 0,
        service_interval_km: parseFloat(form.service_interval_km) || 5000,
      });
      onCreated(vehicle);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <h2>Add new vehicle</h2>

        {error && <div className="error-text">{error}</div>}

        <div className="field">
          <label>Plate number *</label>
          <input
            value={form.plate_number}
            onChange={(e) => set('plate_number', e.target.value.toUpperCase())}
            placeholder="KDA 123A"
            style={{ fontFamily: 'var(--font-mono)' }}
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label>Make</label>
            <input value={form.make} onChange={(e) => set('make', e.target.value)} placeholder="Toyota" />
          </div>
          <div className="field">
            <label>Model</label>
            <input value={form.model} onChange={(e) => set('model', e.target.value)} placeholder="Hiace" />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Year</label>
            <input
              type="number"
              value={form.year}
              onChange={(e) => set('year', e.target.value)}
              placeholder="2021"
              min="1990"
              max="2100"
            />
          </div>
          <div className="field">
            <label>Current odometer (km)</label>
            <input
              type="number"
              value={form.current_odometer_km}
              onChange={(e) => set('current_odometer_km', e.target.value)}
              placeholder="0"
              min="0"
            />
          </div>
        </div>

        <div className="field">
          <label>Service interval (km)</label>
          <input
            type="number"
            value={form.service_interval_km}
            onChange={(e) => set('service_interval_km', e.target.value)}
            placeholder="5000"
            min="100"
          />
          <div className="helper-text">How many km between services? Default is 5,000 km.</div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-signal" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Adding…' : 'Add vehicle'}
          </button>
        </div>
      </div>
    </div>
  );
}
