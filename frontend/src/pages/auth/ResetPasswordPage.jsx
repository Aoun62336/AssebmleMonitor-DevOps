import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import { useToast } from "../../components/common/ToastProvider";

const initialState = { newPassword: "", confirmPassword: "" };

export default function ResetPasswordPage() {
  const [form, setForm] = useState(initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!token) {
      showToast("Invalid or missing reset token.", "danger");
      return;
    }
    if (!form.newPassword || !form.confirmPassword) {
      showToast("Please fill in all fields", "warning");
      return;
    }
    if (form.newPassword.length < 8) {
      showToast("Password must be at least 8 characters", "warning");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      showToast("Passwords do not match", "danger");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: form.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to reset password");

      showToast("Password reset successful!", "success");
      window.setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      showToast(err.message, "danger");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter and confirm your new password below."
      brandTitle="Create New Password"
      brandText="Choose a strong password to keep your workspace and project data secure."
      footer={<Link to="/login">← Back to Sign In</Link>}
    >
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="newPassword">New Password</label>
          <div style={{ position: "relative" }}>
            <input
              id="newPassword"
              name="newPassword"
              type={showPassword ? "text" : "password"}
              className="form-control"
              placeholder="Minimum 8 characters"
              value={form.newPassword}
              onChange={onChange}
              style={{ paddingRight: "40px" }}
            />
            <span
              className="material-symbols-outlined"
              onClick={() => setShowPassword(!showPassword)}
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
          <label htmlFor="confirmPassword">Confirm Password</label>
          <div style={{ position: "relative" }}>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              className="form-control"
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={onChange}
              style={{ paddingRight: "40px" }}
            />
            <span
              className="material-symbols-outlined"
              onClick={() => setShowConfirm(!showConfirm)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "var(--text-muted)"
              }}
            >
              {showConfirm ? "visibility_off" : "visibility"}
            </span>
          </div>
        </div>
        <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-block btn-lg" style={{ marginTop: "8px" }}>
          <span className="material-symbols-outlined">lock_reset</span>
          {isSubmitting ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </AuthLayout>
  );
}
