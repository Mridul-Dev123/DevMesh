import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import GuestRoute from "../components/GuestRoute.jsx";

const LoginPage = lazy(() => import("../features/auth/LoginPage.jsx"));
const RegisterPage = lazy(() => import("../features/auth/RegisterPage.jsx"));
const FeedPage = lazy(() => import("../features/posts/FeedPage.jsx"));

const router = createBrowserRouter([
    // Root → redirect to feed (ProtectedRoute will bounce to /login if not authed)
    {
        path: "/",
        element: <Navigate to="/feed" replace />,
    },

    // Guest-only routes
    {
        path: "/login",
        element: (
            <GuestRoute>
                <Suspense fallback={<div>Loading...</div>}>
                    <LoginPage />
                </Suspense>
            </GuestRoute>
        ),
    },
    {
        path: "/register",
        element: (
            <GuestRoute>
                <Suspense fallback={<div>Loading...</div>}>
                    <RegisterPage />
                </Suspense>
            </GuestRoute>
        ),
    },

    // Protected routes
    {
        path: "/feed",
        element: (
            <ProtectedRoute>
                <Suspense fallback={<div>Loading...</div>}>
                    <FeedPage />
                </Suspense>
            </ProtectedRoute>
        ),
    },

    // Catch-all
    {
        path: "*",
        element: <Navigate to="/" replace />,
    },
]);

export default function AppRouter() {
    return <RouterProvider router={router} />;
}
