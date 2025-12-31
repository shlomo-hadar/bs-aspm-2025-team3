import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireTrainer?: boolean;
}

export function ProtectedRoute({ children, requireTrainer = false }: ProtectedRouteProps) {
  const { user, profile, loading, isTrainer } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requireTrainer && !isTrainer) {
    return <Navigate to="/my-workouts" replace />;
  }

  return <>{children}</>;
}
