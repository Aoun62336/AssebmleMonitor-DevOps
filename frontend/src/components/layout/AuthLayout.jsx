import { Link } from "react-router-dom";

export default function AuthLayout({ title, subtitle, brandTitle, brandText, children, footer }) {
  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="auth-brand-content">
          <img src="/assets/logo.png" alt="AssembleMonitor" />
          <h2>{brandTitle}</h2>
          <p>{brandText}</p>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-wrapper">
          <Link to="/" className="auth-form-logo">
            <img src="/assets/logo.png" alt="AssembleMonitor" />
            <span>
              Assemble<em>Monitor</em>
            </span>
          </Link>

          <h1>{title}</h1>
          <p className="subtitle">{subtitle}</p>

          {children}
          <div className="form-footer">{footer}</div>
        </div>
      </div>
    </div>
  );
}
