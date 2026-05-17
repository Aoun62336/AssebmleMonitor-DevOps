import { useMemo, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import LegacyPageContent from "../../components/dashboard/LegacyPageContent";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { dashboardRoutes } from "../../data/siteConfig";

export default function DashboardRoutePage({ role, defaultSlug = "index" }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { slug, legacy } = useParams();
  const resolvedSlug = slug ?? legacy ?? defaultSlug;
  const navigate = useNavigate();

  const auth = useMemo(() => {
    try {
      const str = localStorage.getItem("am_auth");
      if (!str) return null;
      const parsed = JSON.parse(str);
      // Only return if it's a valid session object
      if (parsed && parsed.access_token && parsed.role && parsed.loggedIn) {
        return parsed;
      }
      return null;
    } catch (e) {
      console.error("Auth parse error on reload:", e);
      return null;
    }
  }, []);

  if (!auth) {
    // If we're definitely not logged in, redirect
    return <Navigate to="/login" replace />;
  }

  // Basic RBAC check: if the route role doesn't match the user's role, redirect to their own dashboard
  if (auth.role !== role) {
    return <Navigate to={`/${auth.role}`} replace />;
  }

  const page = useMemo(() => {
    return (
      dashboardRoutes.find((route) => route.role === role && route.slug === resolvedSlug) ??
      dashboardRoutes.find((route) => route.role === role && route.slug === "index")
    );
  }, [resolvedSlug, role]);

  return (
    <DashboardLayout role={role} page={page} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
      <LegacyPageContent role={role} fileName={page.fileName} />
    </DashboardLayout>
  );
}
