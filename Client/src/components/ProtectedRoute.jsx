import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center px-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-6 py-5 text-center shadow-lg shadow-slate-900/50">
                    <p className="text-sm font-semibold text-slate-200">Checking session...</p>
                    <p className="mt-1 text-xs text-slate-400">Please wait a moment</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Save the page they were trying to reach so login can redirect back
        return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
    }

    return children;
};

export default ProtectedRoute;
