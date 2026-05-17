import { Link } from "react-router-dom";
import LandingFooter from "../components/layout/LandingFooter";
import LandingNavbar from "../components/layout/LandingNavbar";

const features = [
  {
    icon: "monitoring",
    title: "Project Oversight",
    description:
      "End-to-end monitoring of site activities with high-fidelity visualization and KPI tracking.",
  },
  {
    icon: "task_alt",
    title: "Task Management",
    description:
      "Dynamic scheduling and workforce deployment tracking across multiple construction sites.",
  },
  {
    icon: "account_balance_wallet",
    title: "Material & Expense",
    description:
      "Precise auditing of resource procurement and financial burn rates through each project stage.",
  },
  {
    icon: "analytics",
    title: "Real-Time Reporting",
    description: "Automated status reports delivered to stakeholders using centralized dashboards.",
  },
];

const roles = [
  { icon: "admin_panel_settings", title: "System Admin", description: "Configuration and global oversight." },
  { icon: "engineering", title: "Project Manager", description: "Milestone, resource, and budget control." },
  { icon: "construction", title: "Site Engineer", description: "On-site tasking and quality execution." },
  { icon: "person", title: "Client", description: "Transparent progress and timeline visibility." },
];

export default function HomePage() {
  return (
    <>
      <LandingNavbar />
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-text">
            <div className="hero-badge">
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                construction
              </span>
              Enterprise Construction Platform
            </div>
            <h1>
              Centralized
              <br />
              Construction <span>Site Control</span>
            </h1>
            <p>
              Manage projects, track resources, and monitor real-time progress from a single authoritative
              source of truth.
            </p>
            <div className="hero-actions">
              <Link to="/login" className="btn btn-primary btn-lg">
                <span className="material-symbols-outlined">login</span>
                Access Dashboard
              </Link>
              <a href="#features" className="btn btn-outline btn-lg">
                <span className="material-symbols-outlined">explore</span>
                Explore Features
              </a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-image-card">
              <div className="hero-dashboard-preview">
                {[
                  ["Active Projects", "24", "▲ 12% this quarter"],
                  ["Tasks Completed", "1,847", "▲ 8.5% vs last month"],
                  ["Total Workforce", "3,200", "▲ 5% growth"],
                  ["Budget Utilized", "₹42Cr", "On track"],
                ].map(([label, value, change]) => (
                  <div className="preview-stat" key={label}>
                    <div className="label">{label}</div>
                    <div className="value">{value}</div>
                    <div className="change">{change}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <div className="container-lg">
          <div className="section-header animate-in">
            <div className="section-label">Platform Capabilities</div>
            <h2 className="section-title">Everything You Need to Build Smarter</h2>
            <p className="section-subtitle">
              End-to-end construction management tools designed for enterprise-scale operations.
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={feature.title} className={`feature-card animate-in animate-in-delay-${index + 1}`}>
                <div className="feature-icon">
                  <span className="material-symbols-outlined">{feature.icon}</span>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="roles" id="roles">
        <div className="container-lg">
          <div className="section-header animate-in">
            <div className="section-label">Designed for Construction Teams</div>
            <h2 className="section-title">Role-Based Access Control</h2>
          </div>
          <div className="roles-grid">
            {roles.map((role, index) => (
              <div key={role.title} className={`role-card animate-in animate-in-delay-${index + 1}`}>
                <div className="role-avatar">
                  <span className="material-symbols-outlined">{role.icon}</span>
                </div>
                <h3>{role.title}</h3>
                <p>{role.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta" id="about">
        <div className="container">
          <h2>Take Full Control of Your Construction Projects Today</h2>
          <p>Join the enterprise standard for site monitoring and data-driven management.</p>
          <Link to="/login" className="btn btn-primary btn-lg">
            <span className="material-symbols-outlined">rocket_launch</span>
            Get Started Now
          </Link>
        </div>
      </section>
      <LandingFooter />
    </>
  );
}
