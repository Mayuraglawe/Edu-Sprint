import { Navigate } from "react-router-dom";
import { authAPI } from "@/lib/api";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const isAuthenticated = authAPI.isAuthenticated();
  const user = authAPI.getCurrentUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === "faculty") {
      return <Navigate to="/faculty" replace />;
    } else if (user.role === "student") {
      return <Navigate to="/student" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
