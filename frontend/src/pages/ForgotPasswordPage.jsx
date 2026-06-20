// src/pages/ForgotPasswordPage.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await api.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter") handleSubmit();
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand">
          Fleet<span>Track</span>
        </div>
        <div className="auth-sub">Reset your password</div>

        {sent ? (
          <>
            <div
              className="demo-hint"
              style={{ borderLeft: "3px solid var(--go)", color: "var(--ink)" }}
            >
              <strong>Check your inbox</strong>
              <br />
              If an account exists for <strong>{email}</strong>, we've sent a
              link to reset your password. It expires in 30 minutes.
            </div>
            <div className="auth-toggle">
              <Link
                to="/login"
                style={{ color: "var(--signal)", fontWeight: 600 }}
              >
                Back to sign in
              </Link>
            </div>
          </>
        ) : (
          <>
            <p
              style={{
                color: "var(--steel)",
                fontSize: "0.88rem",
                marginTop: -8,
                marginBottom: 20,
              }}
            >
              Enter your email address and we'll send you a link to reset your
              password.
            </p>

            {error && <div className="error-text">{error}</div>}

            <div className="field">
              <label>Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                onKeyDown={handleKey}
                autoFocus
              />
            </div>

            <button
              className="btn btn-signal btn-block"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Sending…" : "Send reset link"}
            </button>

            <div className="auth-toggle">
              <Link to="/login">Back to sign in</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
