import { Navigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { PageSpinner } from "@/components/ui";

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageSpinner />;
  }

  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
