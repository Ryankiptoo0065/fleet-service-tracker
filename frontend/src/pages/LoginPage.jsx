// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'driver' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit() {
    setError('');
    setLoading(true);
    try {
      let result;
      if (mode === 'login') {
        result = await api.login(form.email, form.password);
      } else {
        if (!form.name.trim()) { setError('Name is required'); setLoading(false); return; }
        result = await api.register(form.name, form.email, form.password, form.role);
      }
      login(result.user, result.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter') handleSubmit();
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand">
          Fleet<span>Track</span>
        </div>
        <div className="auth-sub">
          {mode === 'login' ? 'Sign in to manage your fleet' : 'Create a new account'}
        </div>

        {mode === 'login' && (
          <div className="demo-hint">
            <strong>Demo credentials</strong>
            <br />
            Admin: admin@example.com / admin123
            <br />
            Driver: john@example.com / driver123
          </div>
        )}

        {error && <div className="error-text">{error}</div>}

        {mode === 'register' && (
          <div className="field">
            <label>Full name</label>
            <input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="John Kamau"
              onKeyDown={handleKey}
            />
          </div>
        )}

        <div className="field">
          <label>Email address</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="you@company.com"
            onKeyDown={handleKey}
          />
        </div>

        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
            placeholder="••••••••"
            onKeyDown={handleKey}
          />
        </div>

        {mode === 'register' && (
          <div className="field">
            <label>Role</label>
            <select value={form.role} onChange={(e) => set('role', e.target.value)}>
              <option value="driver">Driver</option>
              <option value="admin">Fleet Admin</option>
            </select>
          </div>
        )}

        <button
          className="btn btn-signal btn-block"
          onClick={handleSubmit}
          disabled={loading}
          style={{ marginTop: 8 }}
        >
          {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>

        <div className="auth-toggle">
          {mode === 'login' ? (
            <>
              No account?{' '}
              <button onClick={() => { setMode('register'); setError(''); }}>Register here</button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button onClick={() => { setMode('login'); setError(''); }}>Sign in</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
