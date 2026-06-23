// src/components/AppShell.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export function AppShell({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <nav className="sidebar">
        <div>
          <div className="sidebar-brand">
            Fleet<span>Track</span>
          </div>
          <div className="sidebar-tagline">Vehicle Service Manager</div>

          <NavLink
            to="/dashboard"
            className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
          >
            📊 Dashboard
          </NavLink>
          <NavLink
            to="/vehicles"
            className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
          >
            🚛 Vehicles
          </NavLink>
        </div>

        <div className="sidebar-footer">
          <div style={{ marginBottom: 10, fontSize: '0.78rem' }}>
            Signed in as <strong>{user?.name}</strong>
            <br />
            <span style={{ textTransform: 'capitalize' }}>{user?.role}</span>
          </div>
          <button onClick={handleLogout}>Sign out</button>
        </div>

        <button className="mobile-signout" onClick={handleLogout} aria-label="Sign out">
          ⎋
        </button>
      </nav>

      <main className="main-content">{children}</main>
    </div>
  );
}
