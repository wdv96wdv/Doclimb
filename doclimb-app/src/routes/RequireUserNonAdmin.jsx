import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireUserNonAdmin({ children }) {
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role?.toUpperCase() === "ADMIN";

  if (!userProfile) return <Navigate to="/login" replace />;
  if (isAdmin) return <Navigate to="/admin" replace />;
  return children;
}
