import { Link } from "react-router-dom";
import { ShieldCheck, ArrowLeft, Construction } from "lucide-react";
import "../pages/Portal.css";

function FeaturePage({ title, description }) {
  return (
    <main className="access-page">
      <Link to="/" className="access-brand">
        <ShieldCheck size={30} /> CivicRelief
      </Link>
      <section className="access-card">
        <div className="access-icon"><Construction size={28} /></div>
        <p className="access-eyebrow">CIVICRELIEF PORTAL</p>
        <h1>{title}</h1>
        <p className="access-description">{description}</p>
        <div className="implementation-notice">
          This page is a planned feature. It is not yet connected to a live
          backend workflow.
        </div>
        <Link to="/" className="back-link"><ArrowLeft size={16} /> Back to home</Link>
      </section>
    </main>
  );
}

export default FeaturePage;
