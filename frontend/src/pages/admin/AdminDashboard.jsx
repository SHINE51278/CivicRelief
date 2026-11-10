
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ShieldCheck,
  LayoutDashboard,
  RefreshCw,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  MapPin,
  History,
  X,
  User,
  CalendarDays,
  AlertCircle,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import "../../App.css";

const API = "http://127.0.0.1:8000";

const STATUSES = [
  "Submitted",
  "In Review",
  "Verified",
  "Assigned",
  "In Progress",
  "Resolved",
];

const getAdminToken = () =>
  sessionStorage.getItem("civicrelief_admin_token");

function AdminDashboard() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);

  const [apiStatus, setApiStatus] = useState("Checking...");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [updatingReportId, setUpdatingReportId] = useState(null);

  // STATUS UPDATE DIALOG STATE
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState(null);
  const [statusRemarks, setStatusRemarks] = useState("");
  const [statusModalError, setStatusModalError] = useState("");

  // HISTORY MODAL STATE
  const [selectedReport, setSelectedReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  // HANDLE UNAUTHORIZED REQUESTS
  const handleUnauthorized = useCallback(() => {
    sessionStorage.removeItem("civicrelief_admin_token");
    sessionStorage.removeItem("civicrelief_admin_user");

    setApiStatus("Offline");
    setError("Your administrator session has expired. Please log in again.");

    navigate("/admin/login", { replace: true });
  }, [navigate]);

  // LOAD DASHBOARD DATA
  const loadDashboard = useCallback(async () => {
    const token = getAdminToken();

    if (!token) {
      handleUnauthorized();
      setLoading(false);
      return;
    }

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [reportsResponse, statsResponse] = await Promise.all([
        fetch(`${API}/api/v1/reports/`, {
          method: "GET",
          headers,
        }),

        fetch(`${API}/api/v1/reports/stats/summary`, {
          method: "GET",
          headers,
        }),
      ]);

      if (
        reportsResponse.status === 401 ||
        statsResponse.status === 401
      ) {
        handleUnauthorized();
        return;
      }

      if (
        reportsResponse.status === 403 ||
        statsResponse.status === 403
      ) {
        throw new Error(
          "You are not authorized to access administrator data."
        );
      }

      if (!reportsResponse.ok || !statsResponse.ok) {
        throw new Error(
          `Unable to retrieve dashboard data. Reports: ${reportsResponse.status}, Statistics: ${statsResponse.status}`
        );
      }

      const reportsData = await reportsResponse.json();
      const statsData = await statsResponse.json();

      if (!Array.isArray(reportsData)) {
        throw new Error("Invalid reports response from server.");
      }

      setReports(reportsData);
      setStats(statsData);

      setApiStatus("Connected");
      setError("");
    } catch (err) {
      setApiStatus("Offline");
      setError(err.message || "Backend connection failed.");
    } finally {
      setLoading(false);
    }
  }, [handleUnauthorized]);

  // INITIAL DASHBOARD LOAD
  useEffect(() => {
    const timer = setTimeout(() => {
      loadDashboard();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadDashboard]);

  // MANUAL REFRESH
  const handleRefresh = () => {
    setLoading(true);
    setError("");
    loadDashboard();
  };

  // UPDATE REPORT STATUS WITH REMARKS
  const updateStatus = useCallback(
    async (reportId, newStatus, remarks) => {
      const token = getAdminToken();

      if (!token) {
        handleUnauthorized();
        return false;
      }

      setUpdatingReportId(reportId);
      setError("");
      setStatusModalError("");

      try {
        const response = await fetch(
          `${API}/api/v1/reports/${reportId}/status`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              status: newStatus,
              remarks: remarks.trim() || null,
            }),
          }
        );

        const data = await response.json().catch(() => ({}));

        if (response.status === 401) {
          handleUnauthorized();
          return false;
        }

        if (response.status === 403) {
          throw new Error(
            "You are not authorized to update reports."
          );
        }

        if (!response.ok) {
          throw new Error(
            typeof data.detail === "string"
              ? data.detail
              : `Unable to update report status. Server returned ${response.status}.`
          );
        }

        await loadDashboard();

        return true;
      } catch (err) {
        setStatusModalError(err.message || "Status update failed.");
        return false;
      } finally {
        setUpdatingReportId(null);
      }
    },
    [handleUnauthorized, loadDashboard]
  );

  // OPEN STATUS UPDATE DIALOG
  const handleStatusSelection = (report, newStatus) => {
    if (newStatus === report.status) return;

    setPendingStatusUpdate({
      reportId: report.id,
      title: report.title,
      oldStatus: report.status,
      newStatus,
    });

    setStatusRemarks("");
    setStatusModalError("");
  };

  // CANCEL STATUS UPDATE
  const cancelStatusUpdate = () => {
    if (updatingReportId !== null) return;

    setPendingStatusUpdate(null);
    setStatusRemarks("");
    setStatusModalError("");
  };

  // CONFIRM STATUS UPDATE
  const confirmStatusUpdate = async () => {
    if (!pendingStatusUpdate || updatingReportId !== null) return;

    const success = await updateStatus(
      pendingStatusUpdate.reportId,
      pendingStatusUpdate.newStatus,
      statusRemarks
    );

    if (success) {
      setPendingStatusUpdate(null);
      setStatusRemarks("");
      setStatusModalError("");
    }
  };

  // FETCH REPORT STATUS HISTORY
  const viewHistory = async (report) => {
    const token = getAdminToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    setSelectedReport(report);
    setHistory([]);
    setHistoryError("");
    setHistoryLoading(true);

    try {
      const response = await fetch(
        `${API}/api/v1/reports/${report.id}/history`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (response.status === 403) {
        throw new Error(
          "You are not authorized to view report history."
        );
      }

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Unable to retrieve report history."
        );
      }

      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      setHistoryError(
        err.message === "Failed to fetch"
          ? "Unable to connect to the CivicRelief backend."
          : err.message
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  // CLOSE HISTORY MODAL
  const closeHistory = () => {
    setSelectedReport(null);
    setHistory([]);
    setHistoryError("");
  };

  // FILTER REPORTS
  const filteredReports = reports.filter((report) => {
    return (
      categoryFilter === "all" ||
      report.category === categoryFilter
    );
  });

  // CHART DATA
  const chartData = stats
    ? [
        {
          name: "Civic",
          reports: Number(stats.civic_reports ?? 0),
        },
        {
          name: "Emergency",
          reports: Number(stats.emergency_reports ?? 0),
        },
        {
          name: "Resolved",
          reports: Number(stats.resolved_reports ?? 0),
        },
        {
          name: "Pending",
          reports: Number(stats.pending_reports ?? 0),
        },
      ]
    : [];

  // ADMIN LOGOUT
  const handleLogout = () => {
    sessionStorage.removeItem("civicrelief_admin_token");
    sessionStorage.removeItem("civicrelief_admin_user");

    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="admin-app">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <a href="#dashboard" className="admin-brand">
          <ShieldCheck size={30} />
          <span>CivicRelief</span>
        </a>

        <p className="sidebar-label">MAIN MENU</p>

        <a href="#dashboard" className="sidebar-link active">
          <LayoutDashboard size={19} />
          Dashboard
        </a>

        <a href="#reports" className="sidebar-link">
          <FileText size={19} />
          Manage Reports
        </a>

        <div className="sidebar-footer">
          <span className="admin-avatar">A</span>

          <div>
            <strong>Administrator</strong>
            <small>Management Panel</small>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="sidebar-link"
          style={{
            width: "100%",
            border: "none",
            cursor: "pointer",
            background: "transparent",
            textAlign: "left",
          }}
        >
          Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main" id="dashboard">

        {/* HEADER */}
        <header className="admin-topbar">
          <div>
            <h1>Administrator Dashboard</h1>
            <p>Monitor and manage community reports.</p>
          </div>

          <div className="admin-actions">
            <span
              className={`api-indicator ${
                apiStatus === "Connected" ? "connected" : ""
              }`}
            >
              {apiStatus}
            </span>

            <button
              className="refresh-btn"
              onClick={handleRefresh}
              disabled={loading}
              type="button"
            >
              <RefreshCw size={17} />
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </header>

        {/* DASHBOARD ERROR */}
        {error && (
          <div className="dashboard-error" role="alert">
            {error}
          </div>
        )}

        {/* STATISTICS CARDS */}
        <section className="stats-grid">

          <article className="stat-card">
            <div className="stat-icon blue">
              <FileText />
            </div>
            <p>Total Reports</p>
            <h2>{stats?.total_reports ?? "--"}</h2>
          </article>

          <article className="stat-card">
            <div className="stat-icon orange">
              <AlertTriangle />
            </div>
            <p>Emergency Reports</p>
            <h2>{stats?.emergency_reports ?? "--"}</h2>
          </article>

          <article className="stat-card">
            <div className="stat-icon purple">
              <Clock />
            </div>
            <p>Pending Reports</p>
            <h2>{stats?.pending_reports ?? "--"}</h2>
          </article>

          <article className="stat-card">
            <div className="stat-icon green">
              <CheckCircle />
            </div>
            <p>Resolved Reports</p>
            <h2>{stats?.resolved_reports ?? "--"}</h2>
          </article>

        </section>

        {/* REPORT OVERVIEW CHART */}
        <section className="chart-card">
          <div className="panel-heading">
            <div>
              <h2>Report Overview</h2>
              <p>Live statistics from PostgreSQL</p>
            </div>
          </div>

          <div
            className="chart-container"
            style={{
              width: "100%",
              height: "320px",
              minHeight: "320px",
              position: "relative",
            }}
          >
            {stats && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 20,
                    left: 10,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />

                  <Bar
                    dataKey="reports"
                    fill="#1685c5"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}

            {!stats && loading && (
              <p style={{ textAlign: "center", padding: "40px" }}>
                Loading chart data...
              </p>
            )}
          </div>
        </section>

        {/* REPORT MANAGEMENT */}
        <section className="reports-panel" id="reports">
          <div className="panel-heading reports-heading">
            <div>
              <h2>Report Management</h2>
              <p>Review reports and manage their status.</p>
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter reports by category"
            >
              <option value="all">All Categories</option>
              <option value="civic">Civic</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          <div className="table-wrapper">
            <table className="report-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Report</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>History</th>
                </tr>
              </thead>

              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id}>
                    <td>#{report.id}</td>

                    <td>
                      <strong>{report.title}</strong>
                      <small>{report.description}</small>
                    </td>

                    <td>
                      <span
                        className={`category-tag ${report.category}`}
                      >
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
                      <select
                        className="status-select"
                        value={report.status}
                        disabled={updatingReportId === report.id}
                        onChange={(e) =>
                          handleStatusSelection(report, e.target.value)
                        }
                        aria-label={`Update status for report ${report.id}`}
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      <button
                        type="button"
                        onClick={() => viewHistory(report)}
                        disabled={historyLoading}
                        className="history-button"
                      >
                        <History size={15} />
                        View History
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredReports.length === 0 && (
                  <tr>
                    <td colSpan="6" className="empty-table">
                      {loading
                        ? "Loading reports..."
                        : "No reports found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            Showing {filteredReports.length} of {reports.length} reports
          </div>
        </section>

        {/* FOOTER */}
        <footer className="admin-footer">
          CivicRelief · Academic Software Engineering Project · 2026
        </footer>
      </main>

      {/* STATUS UPDATE MODAL */}
      {pendingStatusUpdate && (
        <div
          className="history-modal-overlay"
          onClick={cancelStatusUpdate}
          role="presentation"
        >
          <section
            className="history-modal status-update-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="status-update-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="history-modal-header">
              <div>
                <span className="track-result-label">
                  REPORT MANAGEMENT
                </span>

                <h2 id="status-update-title">
                  Update Report Status
                </h2>

                <p>{pendingStatusUpdate.title}</p>
              </div>

              <button
                type="button"
                className="history-close-button"
                onClick={cancelStatusUpdate}
                aria-label="Close dialog"
                disabled={updatingReportId !== null}
              >
                <X size={21} />
              </button>
            </div>

            <div className="history-modal-body">
              <div className="status-change-summary">
                <div>
                  <span>Previous Status</span>
                  <strong>{pendingStatusUpdate.oldStatus}</strong>
                </div>

                <div>
                  <span>New Status</span>
                  <strong>{pendingStatusUpdate.newStatus}</strong>
                </div>
              </div>

              <label
                htmlFor="statusRemarks"
                className="status-remarks-label"
              >
                Administrator Remarks
                <span> (Optional)</span>
              </label>

              <textarea
                id="statusRemarks"
                className="status-remarks-input"
                rows={4}
                maxLength={1000}
                placeholder="Explain why this report status is being updated..."
                value={statusRemarks}
                onChange={(event) =>
                  setStatusRemarks(event.target.value)
                }
                disabled={updatingReportId !== null}
              />

              <p className="status-remarks-hint">
                Maximum 1000 characters. These remarks will be
                visible in the report history.
              </p>

              {statusModalError && (
                <div className="history-error" role="alert">
                  <AlertCircle size={19} />
                  {statusModalError}
                </div>
              )}
            </div>

            <div className="history-modal-footer status-update-actions">
              <button
                type="button"
                className="status-cancel-button"
                onClick={cancelStatusUpdate}
                disabled={updatingReportId !== null}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmStatusUpdate}
                disabled={updatingReportId !== null}
              >
                {updatingReportId !== null
                  ? "Updating..."
                  : "Confirm Update"}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* REPORT HISTORY MODAL */}
      {selectedReport && (
        <div
          className="history-modal-overlay"
          onClick={closeHistory}
          role="presentation"
        >
          <section
            className="history-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="history-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="history-modal-header">
              <div>
                <span className="track-result-label">
                  REPORT ACTIVITY
                </span>

                <h2 id="history-modal-title">
                  Report #{selectedReport.id} History
                </h2>

                <p>{selectedReport.title}</p>
              </div>

              <button
                type="button"
                onClick={closeHistory}
                className="history-close-button"
                aria-label="Close history"
              >
                <X size={21} />
              </button>
            </div>

            <div className="history-modal-body">
              {historyLoading && (
                <div className="history-message">
                  <RefreshCw size={22} />
                  <p>Loading report history...</p>
                </div>
              )}

              {historyError && (
                <div className="history-error" role="alert">
                  <AlertCircle size={19} />
                  {historyError}
                </div>
              )}

              {!historyLoading &&
                !historyError &&
                history.length === 0 && (
                  <div className="history-message">
                    <History size={25} />
                    <p>No history records are available.</p>
                  </div>
                )}

              {!historyLoading &&
                !historyError &&
                history.length > 0 && (
                  <>
                    <div className="history-count">
                      {history.length} recorded{" "}
                      {history.length === 1 ? "event" : "events"}
                    </div>

                    <div className="admin-history-timeline">
                      {history.map((item) => (
                        <article
                          key={item.id}
                          className="admin-history-item"
                        >
                          <div className="admin-history-marker">
                            <CheckCircle size={19} />
                          </div>

                          <div className="admin-history-content">
                            <h3>{item.new_status}</h3>

                            {item.old_status && (
                              <p className="history-transition">
                                {item.old_status} → {item.new_status}
                              </p>
                            )}

                            {item.remarks && (
                              <p className="history-remarks">
                                {item.remarks}
                              </p>
                            )}

                            <div className="history-metadata">
                              <span>
                                <User size={14} />
                                {item.changed_by_name || "System"}
                              </span>

                              <span>
                                <CalendarDays size={14} />
                                {item.changed_at
                                  ? new Date(
                                      item.changed_at
                                    ).toLocaleString()
                                  : "Time unavailable"}
                              </span>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </>
                )}
            </div>

            <div className="history-modal-footer">
              <button
                type="button"
                onClick={closeHistory}
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
