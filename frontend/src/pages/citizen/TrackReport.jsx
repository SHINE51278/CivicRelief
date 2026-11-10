
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  ArrowLeft,
  Search,
  MapPin,
  CalendarDays,
  FileText,
  Clock3,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  User,
} from "lucide-react";

import "./TrackReport.css";

const API = "http://127.0.0.1:8000";

function TrackReport() {
  const navigate = useNavigate();

  const [reportId, setReportId] = useState("");
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [historyError, setHistoryError] = useState("");

  async function handleSearch(event) {
    event.preventDefault();

    setError("");
    setHistoryError("");
    setReport(null);
    setHistory([]);

    const token = sessionStorage.getItem("civicrelief_token");

    if (!token) {
      navigate("/citizen/login", { replace: true });
      return;
    }

    // Accept both CR-0001 and 1
    const normalizedId = reportId.trim().replace(/^CR-/i, "");

    if (!/^\d+$/.test(normalizedId) || Number(normalizedId) < 1) {
      setError("Enter a valid report ID, for example CR-0001.");
      return;
    }

    const id = Number(normalizedId);

    setLoading(true);

    try {
      // Step 1: Retrieve report details
      const response = await fetch(
        `${API}/api/v1/reports/mine/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        sessionStorage.removeItem("civicrelief_token");
        sessionStorage.removeItem("civicrelief_user");
        navigate("/citizen/login", { replace: true });
        return;
      }

      if (response.status === 404) {
        throw new Error(
          "Report not found in your account. Check the report ID."
        );
      }

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Unable to retrieve this report."
        );
      }

      setReport(data);

      // Step 2: Retrieve actual status history
      const historyResponse = await fetch(
        `${API}/api/v1/reports/mine/${id}/history`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const historyData = await historyResponse.json();

      if (historyResponse.status === 401) {
        sessionStorage.removeItem("civicrelief_token");
        sessionStorage.removeItem("civicrelief_user");
        navigate("/citizen/login", { replace: true });
        return;
      }

      if (!historyResponse.ok) {
        setHistoryError(
          typeof historyData.detail === "string"
            ? historyData.detail
            : "Unable to retrieve report history."
        );
      } else {
        setHistory(
          Array.isArray(historyData) ? historyData : []
        );
      }
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

  const formattedDate = report?.created_at
    ? new Date(report.created_at).toLocaleString()
    : "Not available";

  return (
    <main className="track-report-page">
      <header className="track-header">
        <Link to="/citizen/dashboard" className="track-brand">
          <ShieldCheck size={30} />
          CivicRelief
        </Link>
      </header>

      <section className="track-container">
        <Link
          to="/citizen/dashboard"
          className="track-back-link"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        <div className="track-card">
          <div className="track-icon">
            <Search size={26} />
          </div>

          <p className="track-eyebrow">CITIZEN PORTAL</p>

          <h1>Track Your Report</h1>

          <p className="track-description">
            Enter your report ID to check its latest status
            and progress.
          </p>

          <form onSubmit={handleSearch} className="track-form">
            <label htmlFor="reportId">Report ID</label>

            <div className="track-search-row">
              <input
                id="reportId"
                type="text"
                placeholder="Example: CR-0001"
                value={reportId}
                onChange={(event) =>
                  setReportId(event.target.value)
                }
                required
              />

              <button type="submit" disabled={loading}>
                {loading ? (
                  <RefreshCw size={17} />
                ) : (
                  <Search size={17} />
                )}

                {loading ? "Searching..." : "Track"}
              </button>
            </div>

            <p className="track-hint">
              You can enter CR-0001 or the numeric report ID 1.
            </p>
          </form>

          {error && (
            <div className="track-error">
              <AlertCircle size={19} />
              {error}
            </div>
          )}

          {report && (
            <section className="track-result">
              <div className="track-result-heading">
                <div>
                  <span className="track-result-label">
                    REPORT DETAILS
                  </span>

                  <h2>
                    CR-{String(report.id).padStart(4, "0")}
                  </h2>
                </div>

                <span className="track-current-status">
                  {report.status}
                </span>
              </div>

              <h3>{report.title}</h3>

              <p className="track-report-description">
                {report.description}
              </p>

              <div className="track-details-grid">
                <div>
                  <FileText size={17} />
                  <span>
                    Category
                    <strong>{report.category}</strong>
                  </span>
                </div>

                <div>
                  <MapPin size={17} />
                  <span>
                    Location
                    <strong>{report.location}</strong>
                  </span>
                </div>

                <div>
                  <CalendarDays size={17} />
                  <span>
                    Submitted
                    <strong>{formattedDate}</strong>
                  </span>
                </div>
              </div>

              {/* REAL DATABASE STATUS HISTORY */}
              <div className="track-progress-heading">
                <h3>Report Status History</h3>
                <span>
                  {history.length} {history.length === 1 ? "Update" : "Updates"}
                </span>
              </div>

              {historyError && (
                <div className="track-error">
                  <AlertCircle size={19} />
                  {historyError}
                </div>
              )}

              {!historyError && history.length === 0 && (
                <p className="track-hint">
                  No status history is available for this report yet.
                </p>
              )}

              {!historyError && history.length > 0 && (
                <div className="track-timeline">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="timeline-step completed"
                    >
                      <div className="timeline-marker">
                        <CheckCircle2 size={19} />
                      </div>

                      <div className="timeline-content">
                        <strong>
                          {item.new_status}
                        </strong>

                        {item.old_status && (
                          <span>
                            Previous status: {item.old_status}
                          </span>
                        )}

                        {item.remarks && (
                          <p>{item.remarks}</p>
                        )}

                        <span>
                          <User size={13} />
                          {item.changed_by_name || "System"}
                        </span>

                        <span>
                          <Clock3 size={13} />
                          {item.changed_at
                            ? new Date(item.changed_at).toLocaleString()
                            : "Time unavailable"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="track-disclaimer">
                This timeline displays status changes recorded
                by CivicRelief. Future stages are not confirmed
                until updated by an authorized administrator.
              </p>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}

export default TrackReport;
