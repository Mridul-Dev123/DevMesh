import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function GuestRoute({ children }) {
 const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-6 py-5 text-center shadow-lg shadow-slate-900/50">
          <p className="text-sm font-semibold text-slate-200">Loading...</p>
        </div>
      </div>
    );
  }
  if (user) {
    return <Navigate to="/feed" />;
  }

  return children;
}