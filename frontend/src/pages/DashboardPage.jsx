// src/pages/DashboardPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../AuthContext';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.summary()
      .then(setSummary)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <>
      <div className="page-header">
        <h1>Good day, {user?.name.split(' ')[0]} 👋</h1>
        <p>Here's your fleet at a glance.</p>
      </div>

      {error && <div className="error-text">{error}</div>}

      {summary && (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="label">Total Vehicles</div>
              <div className="value">{summary.total_vehicles}</div>
            </div>
            <div className="stat-card">
              <div className="label">Active</div>
              <div className="value">{summary.active_vehicles}</div>
            </div>
            <div className={`stat-card ${summary.due_for_service > 0 ? 'alert' : ''}`}>
              <div className="label">Service Due</div>
              <div className="value">{summary.due_for_service}</div>
            </div>
            <div className="stat-card">
              <div className="label">Due Soon</div>
              <div className="value">{summary.due_soon}</div>
            </div>
          </div>

          <div className="stat-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="stat-card">
              <div className="label">Total Service Records</div>
              <div className="value">{summary.total_service_records}</div>
            </div>
            <div className="stat-card">
              <div className="label">Total Service Cost</div>
              <div className="value">
                KES {Number(summary.total_service_cost || 0).toLocaleString()}
              </div>
            </div>
          </div>

          {summary.due_vehicles.length > 0 && (
            <div className="panel" style={{ borderLeft: '3px solid var(--signal)' }}>
              <h2 style={{ color: 'var(--signal)', marginBottom: 12 }}>
                ⚠️ Vehicles requiring service now
              </h2>
              <div className="table-wrap" style={{ border: 'none' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Plate</th>
                      <th>km Overdue</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.due_vehicles.map((v) => (
                      <tr
                        key={v.id}
                        className="clickable"
                        onClick={() => navigate(`/vehicles/${v.id}`)}
                      >
                        <td>
                          <span className="mono">{v.plate_number}</span>
                        </td>
                        <td style={{ color: 'var(--signal)', fontWeight: 600 }}>
                          +{Math.round(v.km_overdue).toLocaleString()} km
                        </td>
                        <td style={{ color: 'var(--steel)', fontSize: '0.82rem' }}>
                          View →
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {summary.due_for_service === 0 && (
            <div className="panel" style={{ borderLeft: '3px solid var(--go)', textAlign: 'center', padding: 32 }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>✅</div>
              <div style={{ fontWeight: 600, color: 'var(--go)' }}>All vehicles are up to date on service</div>
              <div style={{ color: 'var(--steel)', fontSize: '0.88rem', marginTop: 4 }}>Nothing due right now.</div>
            </div>
          )}
        </>
      )}

      {!summary && !error && (
        <div style={{ color: 'var(--steel)' }}>Loading…</div>
      )}
    </>
  );
}
