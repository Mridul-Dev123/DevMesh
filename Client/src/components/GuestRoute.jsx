import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function GuestRoute({ children }) {
 const { user, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  if (user) {
    return <Navigate to="/feed" />;
  }

  return children;
}