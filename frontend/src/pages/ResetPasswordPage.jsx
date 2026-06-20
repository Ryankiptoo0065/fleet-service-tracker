// src/pages/ResetPasswordPage.jsx
import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../api/client';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit() {
    if (!token) {
      setError('This reset link is missing its token. Please request a new one.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter') handleSubmit();
  }

  if (!token) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <div className="auth-brand">
            Fleet<span>Track</span>
          </div>
          <div className="error-text" style={{ marginTop: 12 }}>
            This reset link is invalid or missing its token.
          </div>
          <div className="auth-toggle">
            <Link to="/forgot-password" style={{ color: 'var(--signal)', fontWeight: 600 }}>
              Request a new reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand">
          Fleet<span>Track</span>
        </div>
        <div className="auth-sub">Choose a new password</div>

        {success ? (
          <div
            className="demo-hint"
            style={{ borderLeft: '3px solid var(--go)', color: 'var(--ink)' }}
          >
            <strong>Password reset!</strong>
            <br />
            Redirecting you to sign in…
          </div>
        ) : (
          <>
            {error && <div className="error-text">{error}</div>}

            <div className="field">
              <label>New password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                onKeyDown={handleKey}
                autoFocus
              />
            </div>

            <div className="field">
              <label>Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                onKeyDown={handleKey}
              />
            </div>

            <button
              className="btn btn-signal btn-block"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Saving…' : 'Reset password'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
