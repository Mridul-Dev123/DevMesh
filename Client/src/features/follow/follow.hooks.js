import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as followApi from "./follow.api";
import toast from "react-hot-toast";

/**
 * Get follow status between the current user and a target user
 * @param {string} userId
 */
export const useFollowStatus = (userId) => {
    return useQuery({
        queryKey: ["followStatus", userId],
        queryFn: () => followApi.getFollowStatus(userId),
        enabled: !!userId,
    });
};

/**
 * Follow a user
 * @param {string} userId
 */
export const useFollow = (userId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => followApi.followUser(userId),
        onSuccess: () => {
            toast.success("Follow request sent!");
            queryClient.invalidateQueries({ queryKey: ["followStatus", userId] });
            queryClient.invalidateQueries({ queryKey: ["profile", userId] });
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
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => followApi.unfollowUser(userId),
        onSuccess: () => {
            toast.success("Unfollowed.");
            queryClient.invalidateQueries({ queryKey: ["followStatus", userId] });
            queryClient.invalidateQueries({ queryKey: ["profile", userId] });
        },
        onError: () => {
            toast.error("Failed to unfollow.");
        },
    });
};
