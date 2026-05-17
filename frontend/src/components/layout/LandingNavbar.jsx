import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`landing-nav ${isScrolled ? "scrolled" : ""}`}>
      <div className="nav-inner">
        <Link to="/" className="nav-logo">
          <img src="/assets/logo.png" alt="AssembleMonitor Logo" />
          <span className="nav-logo-text">
            Assemble<span>Monitor</span>
          </span>
        </Link>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#roles">Roles</a>
          <a href="#about">About</a>
        </div>
        <div className="nav-cta">
          <Link to="/login" className="btn btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  );
}
