import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as likeApi from "./like.api";
import toast from "react-hot-toast";

/**
 * Toggle like/unlike on a post with optimistic updates
 * Works with useInfiniteQuery — data is stored as { pages: [{ posts: [] }] }
 * @param {string} postId
 * @param {boolean} isLiked - current like state
 */
export const useToggleLike = (postId, isLiked) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => (isLiked ? likeApi.unlikePost(postId) : likeApi.likePost(postId)),

        // Optimistically update both infinite feed caches
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ["feed"] });

            const previousFeed = queryClient.getQueryData(["feed"]);
            const previousFollowingFeed = queryClient.getQueryData(["feed", "following"]);

            // Patch a single post inside the infinite pages structure
            const patchPages = (old) => {
                if (!old?.pages) return old;
                return {
                    ...old,
                    pages: old.pages.map((page) => ({
                        ...page,
                        posts: page.posts.map((post) => {
                            if (post.id !== postId) return post;
                            const delta = isLiked ? -1 : 1;
                            return {
                                ...post,
                                _count: { ...post._count, likes: (post._count?.likes ?? 0) + delta },
                                isLiked: !isLiked,
                            };
                        }),
                    })),
                };
            };

            queryClient.setQueryData(["feed"], patchPages);
            queryClient.setQueryData(["feed", "following"], patchPages);

            return { previousFeed, previousFollowingFeed };
        },

        // Roll back on error
        onError: (_err, _vars, context) => {
            if (context?.previousFeed !== undefined) {
                queryClient.setQueryData(["feed"], context.previousFeed);
            }
            if (context?.previousFollowingFeed !== undefined) {
                queryClient.setQueryData(["feed", "following"], context.previousFollowingFeed);
            }
            toast.error("Could not update like.");
        },

        // Always re-sync with server
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["feed"] });
        },
    });
};
