import { Navigate, Route, Routes } from "react-router-dom";
import { ToastProvider } from "./components/common/ToastProvider";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import LoginPage from "./pages/auth/LoginPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import DashboardRoutePage from "./pages/dashboard/DashboardRoutePage";
import HomePage from "./pages/HomePage";

function NotFound() {
  return <Navigate to="/" replace />;
}

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route path="/admin" element={<DashboardRoutePage role="admin" />} />
        <Route path="/admin/:slug" element={<DashboardRoutePage role="admin" />} />

        <Route path="/pm" element={<DashboardRoutePage role="pm" />} />
        <Route path="/pm/:slug" element={<DashboardRoutePage role="pm" />} />

        <Route path="/se" element={<DashboardRoutePage role="se" />} />
        <Route path="/se/:slug" element={<DashboardRoutePage role="se" />} />

        <Route path="/client" element={<DashboardRoutePage role="client" />} />
        <Route path="/client/:slug" element={<DashboardRoutePage role="client" />} />

        <Route path="/index.html" element={<Navigate to="/" replace />} />
        <Route path="/login.html" element={<Navigate to="/login" replace />} />
        <Route path="/forgot-password.html" element={<Navigate to="/forgot-password" replace />} />
        <Route path="/reset-password.html" element={<Navigate to="/reset-password" replace />} />

        <Route path="/admin/:legacy.html" element={<DashboardRoutePage role="admin" />} />
        <Route path="/pm/:legacy.html" element={<DashboardRoutePage role="pm" />} />
        <Route path="/se/:legacy.html" element={<DashboardRoutePage role="se" />} />
        <Route path="/client/:legacy.html" element={<DashboardRoutePage role="client" />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </ToastProvider>
  );
}
