import { useMutation } from "@tanstack/react-query";
import * as followApi from "./follow.api";
import toast from "react-hot-toast";

/**
 * Follow a user
 * @param {string} userId
 */
export const useFollow = (userId) => {
    return useMutation({
        mutationFn: () => followApi.followUser(userId),
        onSuccess: () => {
            toast.success("Follow request sent!");
        },
        onError: (error) => {
            const message = error?.response?.data?.message ?? "Failed to follow user.";
            toast.error(message);
        },
    });
};

/**
 * Unfollow a user
 * @param {string} userId
 */
export const useUnfollow = (userId) => {
    return useMutation({
        mutationFn: () => followApi.unfollowUser(userId),
        onSuccess: () => {
            toast.success("Unfollowed.");
        },
        onError: () => {
            toast.error("Failed to unfollow.");
        },
    });
};
