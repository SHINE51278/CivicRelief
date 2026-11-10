import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Users,
  HeartHandshake,
  ArrowRight,
  MapPin,
  Activity,
} from "lucide-react";
import "./Portal.css";

function Home() {
  return (
    <div className="home-page">
      <nav className="home-navbar">
        <Link to="/" className="home-brand">
          <ShieldCheck size={32} />
          <span>CivicRelief</span>
        </Link>
        <div className="home-nav-links">
          <a href="#about">About</a>
          <a href="#portals">Portals</a>
        </div>
      </nav>

      <section className="home-hero">
        <div className="hero-content">
          <span className="hero-label">COMMUNITY SUPPORT PLATFORM</span>
          <h1>
            Report Problems.<br />
            <span>Respond Faster.</span><br />
            Build Safer Communities.
          </h1>
          <p>
            A unified platform to report civic issues, coordinate community
            assistance and support disaster response.
          </p>
          <a href="#portals" className="hero-button">
            Explore Portals <ArrowRight size={18} />
          </a>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="hero-icon-card">
            <ShieldCheck size={76} />
            <h2>CivicRelief</h2>
            <p>Safer communities start with you.</p>
          </div>
          <div className="floating-icon location-icon"><MapPin size={25} /></div>
          <div className="floating-icon activity-icon"><Activity size={25} /></div>
        </div>
      </section>

      <section className="portal-section" id="portals">
        <div className="section-heading">
          <span>GET STARTED</span>
          <h2>Choose Your Portal</h2>
          <p>Access the platform through the portal that matches your role.</p>
        </div>

        <div className="portal-grid">
          <article className="portal-card">
            <div className="portal-icon citizen-color"><Users size={30} /></div>
            <h3>Citizen Portal</h3>
            <p>Report community problems, submit civic complaints and track your reports.</p>
            <Link to="/citizen/login">Citizen Login <ArrowRight size={17} /></Link>
            <Link to="/citizen/register" className="secondary-link">Create Account</Link>
          </article>

          <article className="portal-card">
            <div className="portal-icon admin-color"><ShieldCheck size={30} /></div>
            <h3>Administrator Portal</h3>
            <p>Monitor reports, review issues and manage community response activities.</p>
            <Link to="/admin/login">Administrator Login <ArrowRight size={17} /></Link>
          </article>

          <article className="portal-card">
            <div className="portal-icon volunteer-color"><HeartHandshake size={30} /></div>
            <h3>Volunteer Portal</h3>
            <p>Participate in community assistance and manage assigned volunteer activities.</p>
            <Link to="/volunteer/login">Volunteer Login <ArrowRight size={17} /></Link>
          </article>
        </div>
      </section>

      <section className="home-about" id="about">
        <h2>One Platform. Three Roles. A Stronger Community.</h2>
        <p>
          CivicRelief connects citizens, administrators and volunteers through
          a centralized civic reporting and community response platform.
        </p>
      </section>

      <footer className="home-footer">
        <ShieldCheck size={20} />
        CivicRelief · Academic Software Engineering Project · 2026
      </footer>
    </div>
  );
}

export default Home;
