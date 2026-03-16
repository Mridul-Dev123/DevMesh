import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import * as postApi from "./post.api";
import toast from "react-hot-toast";

/**
 * Fetch the global feed — infinite scroll version
 */
export const useFeed = () => {
    return useInfiniteQuery({
        queryKey: ["feed"],
        queryFn: ({ pageParam = 1 }) => postApi.getFeed({ page: pageParam }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) =>
            lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    });
};

/**
 * Fetch the following-only feed — infinite scroll version
 */
export const useFollowingFeed = () => {
    return useInfiniteQuery({
        queryKey: ["feed", "following"],
        queryFn: ({ pageParam = 1 }) => postApi.getFollowingFeed({ page: pageParam }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) =>
            lastPage.hasNextPage ? lastPage.page + 1 : undefined,
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
 * Update a post — invalidates the feed on success
 */
export const useUpdatePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => postApi.updatePost(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["feed"] });
            toast.success("Post updated.");
        },
        onError: () => {
            toast.error("Failed to update post.");
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
