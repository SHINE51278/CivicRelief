
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  LockKeyhole,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";

import "./AdminLogin.css";

const API = "http://127.0.0.1:8000";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API}/api/v1/auth/admin-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Administrator login failed."
        );
      }

      sessionStorage.setItem("civicrelief_admin_token", data.access_token);
      sessionStorage.setItem(
        "civicrelief_admin_user",
        JSON.stringify(data.user)
      );

      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to CivicRelief. Check whether the backend is running."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-login-page">
      <Link to="/" className="admin-login-brand">
        <ShieldCheck size={31} />
        CivicRelief
      </Link>

      <section className="admin-login-card">
        <div className="admin-login-icon">
          <LockKeyhole size={27} />
        </div>

        <p className="admin-login-eyebrow">SECURE ADMINISTRATION</p>
        <h1>Administrator Login</h1>
        <p className="admin-login-description">
          Sign in with your authorized administrator account
          to manage community reports.
        </p>

        {error && (
          <div className="admin-login-error" role="alert">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="admin-email">Email address</label>
          <input
            id="admin-email"
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            required
          />

          <label htmlFor="admin-password">Password</label>
          <div className="admin-password-field">
            <input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter administrator password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            className="admin-login-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in securely"}
          </button>
        </form>

        <p className="admin-login-note">
          Access is restricted to authorized administrators.
        </p>

        <Link to="/" className="admin-login-home">
          Back to home
        </Link>
      </section>
    </main>
  );
}

export default AdminLogin;
