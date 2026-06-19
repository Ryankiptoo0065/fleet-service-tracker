// src/pages/VehicleDetailPage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../AuthContext';
import { ServiceBadge } from '../components/ServiceBadge';

// ---- Odometer log modal ----
function OdometerModal({ vehicle, onClose, onSaved }) {
  const [reading, setReading] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    const km = parseFloat(reading);
    if (isNaN(km)) { setError('Enter a valid odometer reading'); return; }
    setError('');
    setLoading(true);
    try {
      const updated = await api.logOdometer(vehicle.id, km, note);
      onSaved(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <h2>Log odometer reading</h2>
        <p style={{ color: 'var(--steel)', fontSize: '0.88rem', marginTop: -8, marginBottom: 18 }}>
          Current: <span className="mono">{Number(vehicle.current_odometer_km).toLocaleString()} km</span>
        </p>

        {error && <div className="error-text">{error}</div>}

        <div className="field">
          <label>New odometer reading (km)</label>
          <input
            type="number"
            value={reading}
            onChange={(e) => setReading(e.target.value)}
            placeholder={String(Math.ceil(vehicle.current_odometer_km))}
            min={vehicle.current_odometer_km}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem' }}
            autoFocus
          />
          <div className="helper-text">Must be equal to or greater than the current reading.</div>
        </div>

        <div className="field">
          <label>Note (optional)</label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. End of trip to Mombasa"
          />
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving…' : 'Save reading'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Record service modal ----
function ServiceModal({ vehicle, onClose, onSaved }) {
  const [form, setForm] = useState({
    service_type: '',
    description: '',
    odometer_km: String(Math.ceil(vehicle.current_odometer_km)),
    cost: '',
    garage_name: '',
    service_date: new Date().toISOString().split('T')[0],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const SERVICE_TYPES = [
    'Oil change',
    'Tyre rotation',
    'Tyre replacement',
    'Brake service',
    'Air filter',
    'Transmission service',
    'Full service',
    'Other',
  ];

  async function handleSubmit() {
    if (!form.service_type) { setError('Service type is required'); return; }
    setError('');
    setLoading(true);
    try {
      const updated = await api.recordService(vehicle.id, {
        ...form,
        odometer_km: parseFloat(form.odometer_km) || vehicle.current_odometer_km,
        cost: form.cost ? parseFloat(form.cost) : undefined,
      });
      onSaved(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <h2>Record service</h2>

        {error && <div className="error-text">{error}</div>}

        <div className="field">
          <label>Service type *</label>
          <select value={form.service_type} onChange={(e) => set('service_type', e.target.value)}>
            <option value="">Select service type…</option>
            {SERVICE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Description / notes</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="What was done during this service?"
            style={{ fontFamily: 'inherit', resize: 'vertical' }}
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label>Odometer at service (km)</label>
            <input
              type="number"
              value={form.odometer_km}
              onChange={(e) => set('odometer_km', e.target.value)}
              style={{ fontFamily: 'var(--font-mono)' }}
            />
          </div>
          <div className="field">
            <label>Service date</label>
            <input
              type="date"
              value={form.service_date}
              onChange={(e) => set('service_date', e.target.value)}
            />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Garage / mechanic</label>
            <input
              value={form.garage_name}
              onChange={(e) => set('garage_name', e.target.value)}
              placeholder="e.g. Nairobi Auto Centre"
            />
          </div>
          <div className="field">
            <label>Cost (KES)</label>
            <input
              type="number"
              value={form.cost}
              onChange={(e) => set('cost', e.target.value)}
              placeholder="0"
              min="0"
            />
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-signal" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving…' : 'Save service record'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Service progress bar ----
function ServiceProgress({ vehicle }) {
  const pct = Math.min(
    100,
    (vehicle.km_since_last_service / vehicle.service_interval_km) * 100
  );
  const color = vehicle.is_service_due
    ? 'var(--signal)'
    : vehicle.is_service_due_soon
    ? '#b5712b'
    : 'var(--go)';

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--steel)', marginBottom: 6 }}>
        <span>
          <span className="mono" style={{ fontWeight: 600, color: 'var(--ink)' }}>
            {Math.round(vehicle.km_since_last_service).toLocaleString()} km
          </span>{' '}
          since last service
        </span>
        <span>
          interval:{' '}
          <span className="mono">{Number(vehicle.service_interval_km).toLocaleString()} km</span>
        </span>
      </div>
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      {vehicle.is_service_due && (
        <div style={{ color: 'var(--signal)', fontSize: '0.82rem', marginTop: 6, fontWeight: 600 }}>
          Overdue by {Math.round(-vehicle.km_until_service_due).toLocaleString()} km
        </div>
      )}
      {!vehicle.is_service_due && (
        <div style={{ color: 'var(--steel)', fontSize: '0.82rem', marginTop: 6 }}>
          {Math.round(vehicle.km_until_service_due).toLocaleString()} km until next service
        </div>
      )}
    </div>
  );
}

// ---- Main page ----
export function VehicleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [vehicle, setVehicle] = useState(null);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null); // 'odometer' | 'service' | null

  function load() {
    api.getVehicle(id)
      .then(setVehicle)
      .catch((err) => setError(err.message));
  }

  useEffect(() => { load(); }, [id]);

  function handleOdometerSaved(updatedVehicle) {
    // reload full detail (with logs)
    api.getVehicle(id).then(setVehicle);
    setModal(null);
  }

  function handleServiceSaved() {
    api.getVehicle(id).then(setVehicle);
    setModal(null);
  }

  if (error) {
    return <div className="error-text" style={{ marginTop: 40 }}>{error}</div>;
  }
  if (!vehicle) {
    return <div style={{ color: 'var(--steel)', marginTop: 40 }}>Loading…</div>;
  }

  const title = [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ') || 'Vehicle';

  return (
    <>
      <div className="detail-header">
        <div>
          <button
            onClick={() => navigate('/vehicles')}
            style={{ background: 'none', border: 'none', color: 'var(--steel)', cursor: 'pointer', fontSize: '0.88rem', padding: 0, marginBottom: 8 }}
          >
            ← All vehicles
          </button>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span className="mono">{vehicle.plate_number}</span>
            <ServiceBadge vehicle={vehicle} />
          </h1>
          <div style={{ color: 'var(--steel)', marginTop: 2 }}>{title}</div>
        </div>
        <div className="detail-actions">
          <button className="btn btn-ghost" onClick={() => setModal('odometer')}>
            📍 Log mileage
          </button>
          <button className="btn btn-signal" onClick={() => setModal('service')}>
            🔧 Record service
          </button>
        </div>
      </div>

      <div className="two-col">
        {/* Left column: status + history */}
        <div>
          <div className="panel">
            <h2>Service status</h2>
            <ServiceProgress vehicle={vehicle} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
              {[
                ['Current odometer', `${Number(vehicle.current_odometer_km).toLocaleString()} km`],
                ['Last serviced at', `${Number(vehicle.last_service_odometer_km).toLocaleString()} km`],
                ['Status', vehicle.status],
                ['Year', vehicle.year || '—'],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--steel)', fontWeight: 600 }}>
                    {label}
                  </div>
                  <div className="mono" style={{ marginTop: 4, fontWeight: 600 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <h2>Service history</h2>
            {vehicle.service_records?.length === 0 && (
              <div className="empty-state">No service records yet.</div>
            )}
            {vehicle.service_records?.map((sr) => (
              <div
                key={sr.id}
                style={{
                  borderBottom: '1px solid var(--line)',
                  paddingBottom: 14,
                  marginBottom: 14,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{sr.service_type}</div>
                    {sr.description && (
                      <div style={{ color: 'var(--steel)', fontSize: '0.85rem', marginTop: 2 }}>
                        {sr.description}
                      </div>
                    )}
                    {sr.garage_name && (
                      <div style={{ color: 'var(--steel)', fontSize: '0.82rem' }}>
                        @ {sr.garage_name}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                    <div className="mono" style={{ fontSize: '0.85rem' }}>
                      {Number(sr.odometer_km).toLocaleString()} km
                    </div>
                    {sr.cost && (
                      <div style={{ color: 'var(--go)', fontSize: '0.82rem', fontWeight: 600 }}>
                        KES {Number(sr.cost).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ color: 'var(--steel)', fontSize: '0.78rem', marginTop: 6 }}>
                  {new Date(sr.service_date).toLocaleDateString('en-KE', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                  {sr.serviced_by_name && ` · ${sr.serviced_by_name}`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: recent odometer logs */}
        <div>
          <div className="panel">
            <h2>Odometer log</h2>
            <div style={{ color: 'var(--steel)', fontSize: '0.82rem', marginBottom: 14 }}>
              Last 50 entries
            </div>
            {vehicle.odometer_logs?.length === 0 && (
              <div className="empty-state">No mileage logged yet.</div>
            )}
            {vehicle.odometer_logs?.map((log) => (
              <div
                key={log.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: '1px solid var(--line)',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <div className="mono" style={{ fontWeight: 600 }}>
                    {Number(log.reading_km).toLocaleString()} km
                  </div>
                  {log.note && (
                    <div style={{ color: 'var(--steel)', fontSize: '0.8rem', marginTop: 2 }}>
                      {log.note}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                  <div style={{ color: 'var(--steel)', fontSize: '0.78rem' }}>
                    {new Date(log.logged_at).toLocaleDateString('en-KE', {
                      day: 'numeric', month: 'short',
                    })}
                  </div>
                  {log.logged_by_name && (
                    <div style={{ color: 'var(--steel)', fontSize: '0.75rem' }}>
                      {log.logged_by_name}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modal === 'odometer' && (
        <OdometerModal
          vehicle={vehicle}
          onClose={() => setModal(null)}
          onSaved={handleOdometerSaved}
        />
      )}
      {modal === 'service' && (
        <ServiceModal
          vehicle={vehicle}
          onClose={() => setModal(null)}
          onSaved={handleServiceSaved}
        />
      )}
    </>
  );
}
