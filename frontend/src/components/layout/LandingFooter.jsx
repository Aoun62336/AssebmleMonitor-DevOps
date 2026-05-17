export default function LandingFooter() {
  return (
    <footer className="footer">
      <div className="container-lg">
        <div className="footer-inner">
          <div className="footer-logo">
            <img src="/assets/logo.png" alt="AssembleMonitor" />
            <span>
              Assemble<span style={{ color: "#F39C12" }}>Monitor</span>
            </span>
          </div>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Contact</a>
          </div>
        </div>
        <div className="footer-copy">
          &copy; 2026 AssembleMonitor. All rights reserved. Enterprise Construction Management Platform.
        </div>
      </div>
    </footer>
  );
}
