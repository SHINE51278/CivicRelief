
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  LayoutDashboard,
  FilePlus2,
  ClipboardList,
  LogOut,
  Clock3,
  CheckCircle2,
  Activity,
  AlertCircle,
  RefreshCw,
  MapPin,
} from "lucide-react";

import "./CitizenDashboard.css";

const API = "http://127.0.0.1:8000";

function CitizenDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    total_reports: 0,
    pending_reports: 0,
    in_progress_reports: 0,
    resolved_reports: 0,
  });

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const logout = useCallback(() => {
    sessionStorage.removeItem("civicrelief_token");
    sessionStorage.removeItem("civicrelief_user");
    navigate("/citizen/login", { replace: true });
  }, [navigate]);

  const loadDashboard = useCallback(async () => {
    const token = sessionStorage.getItem("civicrelief_token");
    const storedUser = sessionStorage.getItem("civicrelief_user");

    if (!token || !storedUser) {
      logout();
      return;
    }

    try {
      setLoading(true);
      setError("");

      const parsedUser = JSON.parse(storedUser);

      if (parsedUser.role !== "citizen") {
        logout();
        return;
      }

      setUser(parsedUser);

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [statsResponse, reportsResponse] = await Promise.all([
        fetch(`${API}/api/v1/reports/mine/stats`, { headers }),
        fetch(`${API}/api/v1/reports/mine`, { headers }),
      ]);

      if (
        statsResponse.status === 401 ||
        reportsResponse.status === 401
      ) {
        logout();
        return;
      }

      if (!statsResponse.ok || !reportsResponse.ok) {
        throw new Error("Unable to load dashboard information.");
      }

      const statsData = await statsResponse.json();
      const reportsData = await reportsResponse.json();

      setStats(statsData);
      setReports(reportsData);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [logout]);

 useEffect(() => {
  const timer = setTimeout(() => {
    loadDashboard();
  }, 0);

  return () => clearTimeout(timer);
}, [loadDashboard]);
  const getStatusClass = (status) => {
    switch (status) {
      case "Resolved":
        return "status-resolved";
      case "In Progress":
        return "status-progress";
      case "In Review":
      case "Verified":
      case "Assigned":
        return "status-review";
      default:
        return "status-submitted";
    }
  };

  return (
    <div className="citizen-dashboard">

      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">
        <Link to="/" className="dashboard-brand">
          <ShieldCheck size={30} />
          <span>CivicRelief</span>
        </Link>

        <p className="sidebar-label">MAIN MENU</p>

        <Link
          to="/citizen/dashboard"
          className="sidebar-link active"
        >
          <LayoutDashboard size={19} />
          Dashboard
        </Link>

        <Link
          to="/citizen/submit-report"
          className="sidebar-link"
        >
          <FilePlus2 size={19} />
          Submit a Report
        </Link>

        <Link
          to="/citizen/track-report"
          className="sidebar-link"
        >
          <ClipboardList size={19} />
          Track Reports
        </Link>

        <div className="sidebar-bottom">
          <button
            className="sidebar-logout"
            onClick={logout}
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="dashboard-main">

        <header className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">
              CITIZEN PORTAL
            </p>
            <h1>My Dashboard</h1>
            <p className="dashboard-header-subtitle">
              Manage and track your civic reports.
            </p>
          </div>

          <div className="dashboard-user">
            <div className="user-avatar">
              {user?.full_name?.charAt(0)?.toUpperCase() || "C"}
            </div>
            <div>
              <strong>{user?.full_name || "Citizen"}</strong>
              <span>Citizen Account</span>
            </div>
          </div>
        </header>

        {error && (
          <div className="dashboard-error">
            <AlertCircle size={19} />
            <span>{error}</span>
            <button onClick={loadDashboard}>
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        )}

        {/* STATISTICS */}
        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <h2>Overview</h2>
              <p>Your report activity at a glance.</p>
            </div>

            <button
              className="refresh-button"
              onClick={loadDashboard}
              disabled={loading}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          <div className="dashboard-stats">

            <div className="stat-card">
              <div className="stat-icon blue">
                <ClipboardList size={22} />
              </div>
              <p>Total Reports</p>
              <h3>{loading ? "—" : stats.total_reports}</h3>
            </div>

            <div className="stat-card">
              <div className="stat-icon orange">
                <Clock3 size={22} />
              </div>
              <p>Pending</p>
              <h3>{loading ? "—" : stats.pending_reports}</h3>
            </div>

            <div className="stat-card">
              <div className="stat-icon purple">
                <Activity size={22} />
              </div>
              <p>In Progress</p>
              <h3>{loading ? "—" : stats.in_progress_reports}</h3>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">
                <CheckCircle2 size={22} />
              </div>
              <p>Resolved</p>
              <h3>{loading ? "—" : stats.resolved_reports}</h3>
            </div>

          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="quick-actions">
          <div>
            <h2>Need to report an issue?</h2>
            <p>
              Help make your community safer by reporting
              civic problems and emergencies.
            </p>
          </div>

          <Link
            to="/citizen/submit-report"
            className="primary-action"
          >
            <FilePlus2 size={18} />
            Submit New Report
          </Link>
        </section>

        {/* RECENT REPORTS */}
        <section className="reports-section">
          <div className="section-heading">
            <div>
              <h2>My Recent Reports</h2>
              <p>Latest reports submitted through CivicRelief.</p>
            </div>

            <Link
              to="/citizen/track-report"
              className="view-all-link"
            >
              Track Reports
            </Link>
          </div>

          <div className="reports-table-wrapper">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Issue</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="empty-reports">
                      Loading your reports...
                    </td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-reports">
                      <ClipboardList size={30} />
                      <strong>No reports submitted yet</strong>
                      <span>
                        Your submitted reports will appear here.
                      </span>
                    </td>
                  </tr>
                ) : (
                  reports.slice(0, 8).map((report) => (
                    <tr key={report.id}>
                      <td>CR-{String(report.id).padStart(4, "0")}</td>
                      <td>{report.title}</td>
                      <td>
                        <span className="category-label">
                          {report.category}
                        </span>
                      </td>
                      <td>
                        <span className="location-cell">
                          <MapPin size={14} />
                          {report.location}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`report-status ${getStatusClass(
                            report.status
                          )}`}
                        >
                          {report.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="dashboard-footer">
          © {new Date().getFullYear()} CivicRelief.
          Building safer communities together.
        </footer>

      </main>
    </div>
  );
}

export default CitizenDashboard;
