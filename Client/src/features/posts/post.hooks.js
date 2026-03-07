import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as postApi from "./post.api";
import toast from "react-hot-toast";

/**
 * Fetch the global feed
 */
export const useFeed = () => {
    return useQuery({
        queryKey: ["feed"],
        queryFn: () => postApi.getFeed(),
    });
};

/**
 * Create a new post — invalidates the feed on success
 */
export const useCreatePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: postApi.createPost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["feed"] });
            toast.success("Post created! 🚀");
        },
        onError: (error) => {
            const message = error?.response?.data?.message ?? "Failed to create post.";
            toast.error(message);
        },
    });
};

/**
 * Delete a post — invalidates the feed on success
 */
export const useDeletePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: postApi.deletePost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["feed"] });
            toast.success("Post deleted.");
        },
        onError: () => {
            toast.error("Failed to delete post.");
        },
    });
};

/**
 * Fetch a single post by ID
 * @param {string} id
 */
export const usePost = (id) => {
    return useQuery({
        queryKey: ["post", id],
        queryFn: () => postApi.getPost(id),
        enabled: !!id,
    });
};
