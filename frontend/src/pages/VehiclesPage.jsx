// src/pages/VehiclesPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { ServiceBadge } from '../components/ServiceBadge';
import { AddVehicleModal } from '../components/AddVehicleModal';

export function VehiclesPage() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'due' | 'active'
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState('');

  function loadVehicles() {
    api.getVehicles()
      .then(setVehicles)
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    loadVehicles();
  }, []);

  const filtered = vehicles.filter((v) => {
    if (filter === 'due' && !v.is_service_due) return false;
    if (filter === 'active' && v.status !== 'active') return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        v.plate_number.toLowerCase().includes(q) ||
        (v.make || '').toLowerCase().includes(q) ||
        (v.model || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <>
      <div className="page-header">
        <h1>Vehicles</h1>
        <p>Manage your fleet and track service status for each vehicle.</p>
      </div>

      {error && <div className="error-text">{error}</div>}

      <div className="toolbar">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="toolbar-filters">
            {['all', 'due', 'active'].map((f) => (
              <button
                key={f}
                className={`chip ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : f === 'due' ? '⚠️ Due' : 'Active'}
              </button>
            ))}
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search plate / make / model…"
            style={{
              border: '1px solid var(--line)',
              borderRadius: 7,
              padding: '7px 12px',
              fontSize: '0.88rem',
              fontFamily: 'inherit',
              width: 220,
            }}
          />
        </div>

        <button className="btn btn-signal" onClick={() => setShowAdd(true)}>
          + Add vehicle
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Plate</th>
              <th>Vehicle</th>
              <th>Odometer</th>
              <th>Since last service</th>
              <th>Service status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--steel)', padding: 32 }}>
                  {vehicles.length === 0 ? 'No vehicles yet. Add one to get started.' : 'No vehicles match your filter.'}
                </td>
              </tr>
            )}
            {filtered.map((v) => (
              <tr
                key={v.id}
                className="clickable"
                onClick={() => navigate(`/vehicles/${v.id}`)}
              >
                <td>
                  <span className="mono" style={{ fontWeight: 600 }}>
                    {v.plate_number}
                  </span>
                </td>
                <td>
                  {[v.year, v.make, v.model].filter(Boolean).join(' ') || '—'}
                </td>
                <td>
                  <span className="mono">
                    {Number(v.current_odometer_km).toLocaleString()} km
                  </span>
                </td>
                <td>
                  <span className="mono" style={{ color: v.is_service_due ? 'var(--signal)' : 'inherit' }}>
                    {Math.round(v.km_since_last_service).toLocaleString()} km
                  </span>
                  <span style={{ color: 'var(--steel)', fontSize: '0.78rem', marginLeft: 6 }}>
                    / {Number(v.service_interval_km).toLocaleString()} km
                  </span>
                </td>
                <td>
                  <ServiceBadge vehicle={v} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <AddVehicleModal
          onClose={() => setShowAdd(false)}
          onCreated={(v) => {
            setVehicles((prev) => [...prev, v]);
            setShowAdd(false);
          }}
        />
      )}
    </>
  );
}
