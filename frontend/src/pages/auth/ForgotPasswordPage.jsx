import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import { useToast } from "../../components/common/ToastProvider";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!email.trim()) {
      showToast("Please enter your email address", "warning");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to send reset link");
      
      showToast(data.message || "Password reset link sent to your email!", "success");
      setEmail("");
    } catch (err) {
      showToast(err.message, "danger");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password?"
      subtitle="Enter your registered email and we'll send you a reset link."
      brandTitle="Account Recovery"
      brandText="We'll help you get back to managing your construction projects."
      footer={
        <>
          Remember your password? <Link to="/login">Sign In</Link>
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
            type="email"
            className="form-control"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
          />
        </div>
        <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-block btn-lg" style={{ marginTop: "8px" }}>
          <span className="material-symbols-outlined">mail</span>
          {isSubmitting ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </AuthLayout>
  );
}
