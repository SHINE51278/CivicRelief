
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff, LockKeyhole } from "lucide-react";
import "./CitizenLogin.css";

const API = "http://127.0.0.1:8000";

function CitizenLogin() {
  const navigate = useNavigate();
  const location = useLocation();

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
      const response = await fetch(`${API}/api/v1/auth/login`, {
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
          data.detail || "Unable to sign in. Please check your details."
        );
      }

      // Store the token for this browser tab/session.
      sessionStorage.setItem("civicrelief_token", data.access_token);
      sessionStorage.setItem("civicrelief_user", JSON.stringify(data.user));

      navigate("/citizen/dashboard", { replace: true });
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
    <div className="citizen-login-page">
      <section className="citizen-login-brand">
        <Link to="/" className="citizen-login-logo">
          <ShieldCheck size={30} />
          <span>CivicRelief</span>
        </Link>

        <div className="citizen-login-hero">
          <span className="login-eyebrow">WELCOME BACK</span>
          <h1>Your community deserves a better tomorrow.</h1>
          <p>
            Sign in to report civic issues, follow updates, and help
            make your community safer.
          </p>
        </div>

        <p className="citizen-login-footer">
          Report Problems. Respond Faster. Build Safer Communities.
        </p>
      </section>

      <section className="citizen-login-content">
        <div className="citizen-login-card">
          <div className="citizen-login-icon">
            <LockKeyhole size={26} />
          </div>

          <span className="login-eyebrow">CITIZEN PORTAL</span>
          <h2>Welcome back</h2>
          <p className="citizen-login-subtitle">
            Sign in to continue to your account.
          </p>

          {location.state?.registered && (
            <div className="login-message success">
              Registration successful! Please sign in.
            </div>
          )}

          {error && (
            <div className="login-message error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />

            <label htmlFor="login-password">Password</label>
            <div className="citizen-login-password">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>

            <button
              type="submit"
              className="citizen-login-submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="citizen-login-register">
            Don't have an account?{" "}
            <Link to="/citizen/register">Create an account</Link>
          </p>

          <Link to="/" className="citizen-login-back">
            ← Back to home
          </Link>
        </div>
      </section>
    </div>
  );
}

export default CitizenLogin;
