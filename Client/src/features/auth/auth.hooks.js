import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as authApi from "./auth.api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export const useMe = () => {
    return useQuery({
        queryKey: ["me"],
        queryFn: authApi.getMe,
        retry: false,
    });
};

export const useLogin = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: authApi.login,
        onSuccess: (_, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ["me"] });
            toast.success("Welcome back! 🎉");
            // navigate is called after query invalidates — location.state.from set by ProtectedRoute
            navigate(context?.from ?? "/feed", { replace: true });
        },
        onError: (error) => {
            const message = error?.response?.data?.message ?? "Login failed. Try again.";
            toast.error(message);
        },
    });
};

export const useRegister = () => {
    const navigate = useNavigate();

    return useMutation({
        mutationFn: authApi.register,
        onSuccess: () => {
            toast.success("Account created! Please log in.");
            navigate("/login", { replace: true });
        },
        onError: (error) => {
            const message = error?.response?.data?.message ?? "Registration failed. Try again.";
            toast.error(message);
        },
    });
};

export const useLogout = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: authApi.logout,
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ["me"] });
            toast.success("Logged out successfully.");
            navigate("/login", { replace: true });
        },
        onError: () => {
            toast.error("Logout failed. Try again.");
        },
    });
};