
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, UserPlus, Eye, EyeOff } from "lucide-react";
import "./CitizenRegister.css";

const API = "http://127.0.0.1:8000";

function CitizenRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/api/v1/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error("An account with this email already exists.");
        }

        if (response.status === 422) {
          throw new Error(
            data.detail?.[0]?.msg || "Please check your registration details."
          );
        }

        throw new Error(
          data.detail || "Registration failed. Please try again."
        );
      }

      setSuccess("Your account has been created successfully!");

      setForm({
        full_name: "",
        email: "",
        password: "",
        confirm_password: "",
      });

      setTimeout(() => {
        navigate("/citizen/login", {
          state: { registered: true },
        });
      }, 1200);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to CivicRelief server. Please ensure the backend is running."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-page">
      <div className="register-brand">
        <Link to="/" className="register-logo">
          <ShieldCheck size={30} />
          <span>CivicRelief</span>
        </Link>

        <div className="register-hero">
          <span className="register-eyebrow">CIVIC COMMUNITY PLATFORM</span>

          <h1>
            Your community.
            <br />
            Your voice.
            <br />
            Your impact.
          </h1>

          <p>
            Join CivicRelief to report civic issues, follow their progress,
            and contribute towards safer communities.
          </p>
        </div>

        <p className="register-brand-footer">
          Report Problems. Respond Faster. Build Safer Communities.
        </p>
      </div>

      <div className="register-content">
        <div className="register-card">
          <div className="register-icon">
            <UserPlus size={27} />
          </div>

          <span className="register-eyebrow">CITIZEN ACCOUNT</span>

          <h2>Create your account</h2>

          <p className="register-subtitle">
            Enter your details to join CivicRelief.
          </p>

          {error && (
            <div className="register-message error" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="register-message success" role="status">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label htmlFor="full_name">Full name</label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              placeholder="Enter your full name"
              value={form.full_name}
              onChange={handleChange}
              minLength={2}
              maxLength={100}
              autoComplete="name"
              required
            />

            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />

            <label htmlFor="password">Password</label>
            <div className="register-password">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
                minLength={8}
                maxLength={128}
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>

            <label htmlFor="confirm_password">Confirm password</label>
            <input
              id="confirm_password"
              name="confirm_password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password again"
              value={form.confirm_password}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />

            <button
              type="submit"
              className="register-submit"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Citizen Account"}
            </button>
          </form>

          <p className="register-login">
            Already have an account?{" "}
            <Link to="/citizen/login">Sign in</Link>
          </p>

          <p className="register-security">
            Your password is securely hashed before it is stored.
          </p>

          <Link to="/" className="register-back">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CitizenRegister;
