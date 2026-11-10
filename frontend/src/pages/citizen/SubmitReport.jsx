
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  ArrowLeft,
  Send,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import "./SubmitReport.css";

const API = "http://127.0.0.1:8000";

function SubmitReport() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "civic",
    location: "",
  });

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

    const token = sessionStorage.getItem("civicrelief_token");

    if (!token) {
      navigate("/citizen/login");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/api/v1/reports/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.status === 401) {
        sessionStorage.removeItem("civicrelief_token");
        sessionStorage.removeItem("civicrelief_user");
        navigate("/citizen/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Unable to submit your report."
        );
      }

      setSuccess(
        `Report CR-${String(data.id).padStart(4, "0")} submitted successfully!`
      );

      setForm({
        title: "",
        description: "",
        category: "civic",
        location: "",
      });

    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to CivicRelief server. Check whether the backend is running."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="submit-report-page">

      <header className="submit-report-header">
        <Link to="/citizen/dashboard" className="submit-brand">
          <ShieldCheck size={30} />
          CivicRelief
        </Link>
      </header>

      <section className="submit-report-container">

        <Link
          to="/citizen/dashboard"
          className="submit-back-link"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        <div className="submit-report-card">

          <div className="submit-icon">
            <FileText size={27} />
          </div>

          <p className="submit-eyebrow">
            CITIZEN PORTAL
          </p>

          <h1>Submit a Report</h1>

          <p className="submit-description">
            Help improve your community by reporting civic
            issues and emergencies.
          </p>

          {error && (
            <div className="submit-message error">
              <AlertCircle size={19} />
              {error}
            </div>
          )}

          {success && (
            <div className="submit-message success">
              <CheckCircle2 size={19} />
              {success}
              <Link to="/citizen/dashboard">
                View Dashboard
              </Link>
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <label htmlFor="title">
              Report Title
            </label>

            <input
              id="title"
              name="title"
              type="text"
              placeholder="Example: Damaged streetlight"
              value={form.title}
              onChange={handleChange}
              minLength={3}
              maxLength={150}
              required
            />

            <label htmlFor="category">
              Report Category
            </label>

            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="civic">Civic Issue</option>
              <option value="emergency">Emergency</option>
            </select>

            <label htmlFor="location">
              Issue Location
            </label>

            <div className="submit-input-icon">
              <MapPin size={17} />
              <input
                id="location"
                name="location"
                type="text"
                placeholder="Enter area, street or landmark"
                value={form.location}
                onChange={handleChange}
                minLength={2}
                maxLength={255}
                required
              />
            </div>

            <label htmlFor="description">
              Detailed Description
            </label>

            <textarea
              id="description"
              name="description"
              placeholder="Describe the issue clearly..."
              value={form.description}
              onChange={handleChange}
              minLength={5}
              rows={5}
              required
            />

            <button
              type="submit"
              className="submit-report-button"
              disabled={loading}
            >
              <Send size={18} />
              {loading ? "Submitting..." : "Submit Report"}
            </button>

          </form>

          <p className="submit-note">
            Your report will be associated with your
            authenticated citizen account.
          </p>

        </div>

      </section>
    </main>
  );
}

export default SubmitReport;
