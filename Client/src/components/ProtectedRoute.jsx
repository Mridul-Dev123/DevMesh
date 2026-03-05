import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) return <div>Loading...</div>;

    if (!isAuthenticated) {
        // Save the page they were trying to reach so login can redirect back
        return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
    }

    return children;
};

export default ProtectedRoute;
