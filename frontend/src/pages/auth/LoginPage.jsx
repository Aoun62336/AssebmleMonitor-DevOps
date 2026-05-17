import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import { useToast } from "../../components/common/ToastProvider";
import { authRedirectByRole } from "../../data/siteConfig";

const initialState = {
  email: "",
  password: "",
  role: "admin",
};

export default function LoginPage() {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const togglePassword = () => setShowPassword(!showPassword);

  const onChange = (event) => {
    let { name, value, type, checked } = event.target;
    if (type === "text" && name !== "email" && name !== "password") {
      value = value.replace(/\b\w/g, (l) => l.toUpperCase());
    }
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!form.email || !form.password) {
      showToast("Please fill in all fields", "warning");
      return;
    }

    setLoading(true);
    try {
      const loginRes = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password, role: form.role })
      });

      if (!loginRes.ok) {
        const errData = await loginRes.json().catch(() => null);
        throw new Error(errData?.detail || 'Invalid email or password');
      }

      const tokenData = await loginRes.json();
      
      const meRes = await fetch('/api/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`
        }
      });

      if (!meRes.ok) {
        throw new Error('Failed to load user profile');
      }

      const user = await meRes.json();
      
      const roleMap = {
        'admin': 'admin',
        'project_manager': 'pm',
        'site_engineer': 'se',
        'client': 'client'
      };
      
      const frontendRole = roleMap[user.role] || 'client';

      localStorage.setItem(
        "am_auth",
        JSON.stringify({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          id: user.id,
          email: user.email,
          role: frontendRole,
          name: user.full_name,
          title: user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          initials: user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
          loggedIn: true,
        }),
      );

      showToast("Login successful! Redirecting...", "success");
      window.setTimeout(() => navigate(authRedirectByRole[frontendRole]), 700);
    } catch (err) {
      showToast(err.message, "danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to access your workspace"
      brandTitle="Smart Construction Monitoring"
      brandText="Track projects, manage resources, and monitor site progress from one centralized system."
      footer={
        <>
          Access is provided by your system administrator.
          <br />
          Contact the IT desk if you have trouble logging in.
          <br />
          <br />
          <Link to="/">← Back to Home</Link>
        </>
      }
    >
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            className="form-control"
            placeholder="you@company.com"
            value={form.email}
            onChange={onChange}
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div style={{ position: "relative" }}>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              className="form-control"
              placeholder="Enter your password"
              value={form.password}
              onChange={onChange}
              disabled={loading}
              style={{ paddingRight: "40px" }}
            />
            <span
              className="material-symbols-outlined"
              onClick={togglePassword}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "var(--text-muted)"
              }}
            >
              {showPassword ? "visibility_off" : "visibility"}
            </span>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            name="role"
            className="form-control"
            value={form.role}
            onChange={onChange}
            disabled={loading}
          >
            <option value="admin">Administrator</option>
            <option value="project_manager">Project Manager</option>
            <option value="site_engineer">Site Engineer</option>
            <option value="client">Client</option>
          </select>
        </div>
        <div className="form-row" style={{ justifyContent: "flex-end" }}>
          <Link to="/forgot-password" className="form-link">
            Forgot Password?
          </Link>
        </div>
        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
          <span className="material-symbols-outlined">login</span>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </AuthLayout>
  );
}
