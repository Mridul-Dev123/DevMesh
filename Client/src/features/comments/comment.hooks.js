import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as commentApi from "./comment.api";
import toast from "react-hot-toast";

/**
 * Fetch all comments for a post
 * @param {string} postId
 */
export const useComments = (postId) => {
    return useQuery({
        queryKey: ["comments", postId],
        queryFn: () => commentApi.getComments(postId),
        enabled: !!postId,
    });
};

/**
 * Add a comment to a post
 * @param {string} postId
 */
export const useCreateComment = (postId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ content }) => commentApi.createComment({ postId, content }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["comments", postId] });
            // Also bump the comment count on feed cards
            queryClient.invalidateQueries({ queryKey: ["feed"] });
        },
        onError: () => {
            toast.error("Failed to post comment.");
        },
    });
};

/**
 * Delete a comment
 * @param {string} postId - used to invalidate the comment list
 */
export const useDeleteComment = (postId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: commentApi.deleteComment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["comments", postId] });
            queryClient.invalidateQueries({ queryKey: ["feed"] });
        },
        onError: () => {
            toast.error("Failed to delete comment.");
        },
    });
};
