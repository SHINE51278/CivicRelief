
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Main landing page
import Home from "./pages/Home";

// Shared components
import AccessPage from "./components/AccessPage";
import FeaturePage from "./components/FeaturePage";

// Citizen pages
import CitizenLogin from "./pages/citizen/CitizenLogin";
import CitizenRegister from "./pages/citizen/CitizenRegister";
import CitizenDashboard from "./pages/citizen/CitizenDashboard";
import SubmitReport from "./pages/citizen/SubmitReport";
import TrackReport from "./pages/citizen/TrackReport";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";


// Protect citizen routes
function ProtectedCitizenRoute({ children }) {
  const token = sessionStorage.getItem("civicrelief_token");
  const storedUser = sessionStorage.getItem("civicrelief_user");

  if (!token || !storedUser) {
    return <Navigate to="/citizen/login" replace />;
  }

  let user;

  try {
    user = JSON.parse(storedUser);
  } catch {
    sessionStorage.removeItem("civicrelief_token");
    sessionStorage.removeItem("civicrelief_user");

    return <Navigate to="/citizen/login" replace />;
  }

  if (user.role !== "citizen") {
    return <Navigate to="/citizen/login" replace />;
  }

  return children;
}


// Protect administrator routes
function ProtectedAdminRoute({ children }) {
  const token = sessionStorage.getItem("civicrelief_admin_token");
  const storedUser = sessionStorage.getItem("civicrelief_admin_user");

  if (!token || !storedUser) {
    return <Navigate to="/admin/login" replace />;
  }

  let user;

  try {
    user = JSON.parse(storedUser);
  } catch {
    sessionStorage.removeItem("civicrelief_admin_token");
    sessionStorage.removeItem("civicrelief_admin_user");

    return <Navigate to="/admin/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC LANDING PAGE */}
        <Route
          path="/"
          element={<Home />}
        />


        {/* CITIZEN PORTAL */}

        <Route
          path="/citizen/login"
          element={<CitizenLogin />}
        />

        <Route
          path="/citizen/register"
          element={<CitizenRegister />}
        />

        <Route
          path="/citizen/dashboard"
          element={
            <ProtectedCitizenRoute>
              <CitizenDashboard />
            </ProtectedCitizenRoute>
          }
        />

        <Route
          path="/citizen/submit-report"
          element={
            <ProtectedCitizenRoute>
              <SubmitReport />
            </ProtectedCitizenRoute>
          }
        />

        <Route
          path="/citizen/track-report"
          element={
            <ProtectedCitizenRoute>
              <TrackReport />
            </ProtectedCitizenRoute>
          }
        />


        {/* ADMINISTRATOR PORTAL */}

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />


        {/* VOLUNTEER PORTAL */}

        <Route
          path="/volunteer/login"
          element={
            <AccessPage
              role="Volunteer"
              mode="login"
            />
          }
        />

        <Route
          path="/volunteer/dashboard"
          element={
            <FeaturePage
              title="Volunteer Dashboard"
              description="Volunteer assignments and task progress will be available here."
            />
          }
        />


        {/* INVALID ROUTES */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
