import { Link } from "react-router-dom";
import { ShieldCheck, ArrowLeft, LockKeyhole } from "lucide-react";
import "../pages/Portal.css";

function AccessPage({ role, mode }) {
  const isRegister = mode === "register";

  return (
    <main className="access-page">
      <Link to="/" className="access-brand">
        <ShieldCheck size={30} /> CivicRelief
      </Link>

      <section className="access-card">
        <div className="access-icon"><LockKeyhole size={28} /></div>
        <p className="access-eyebrow">{role.toUpperCase()} PORTAL</p>
        <h1>{isRegister ? "Create your account" : `${role} Login`}</h1>
        <p className="access-description">
          {isRegister
            ? "Create a citizen account to report and track community issues."
            : `Sign-in interface for the ${role.toLowerCase()} portal.`}
        </p>

        <div className="implementation-notice" role="status">
          This page is a frontend placeholder. Secure authentication,
          password hashing and role verification are not connected yet.
          Do not enter real passwords here.
        </div>

        {isRegister && (
          <p className="access-switch">
            Already registered? <Link to="/citizen/login">Citizen login</Link>
          </p>
        )}

        {!isRegister && role === "Citizen" && (
          <p className="access-switch">
            New citizen? <Link to="/citizen/register">Create an account</Link>
          </p>
        )}

        <Link to="/" className="back-link"><ArrowLeft size={16} /> Back to home</Link>
      </section>
    </main>
  );
}

export default AccessPage;
