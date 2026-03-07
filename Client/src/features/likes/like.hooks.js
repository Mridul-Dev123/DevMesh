import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as likeApi from "./like.api";
import toast from "react-hot-toast";

/**
 * Toggle like/unlike on a post with optimistic updates
 * @param {string} postId
 * @param {boolean} isLiked - current like state
 */
export const useToggleLike = (postId, isLiked) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => (isLiked ? likeApi.unlikePost(postId) : likeApi.likePost(postId)),

        // Optimistically update the feed cache for instant UI response
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ["feed"] });
            const previousFeed = queryClient.getQueryData(["feed"]);

            queryClient.setQueryData(["feed"], (old) => {
                if (!Array.isArray(old)) return old;
                return old.map((post) => {
                    if (post.id !== postId) return post;
                    const delta = isLiked ? -1 : 1;
                    return {
                        ...post,
                        _count: { ...post._count, likes: (post._count?.likes ?? 0) + delta },
                        isLiked: !isLiked,
                    };
                });
            });

            return { previousFeed };
        },

        // Roll back on error
        onError: (_err, _vars, context) => {
            if (context?.previousFeed !== undefined) {
                queryClient.setQueryData(["feed"], context.previousFeed);
            }
            toast.error("Could not update like.");
        },

        // Always re-sync with server
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["feed"] });
        },
    });
};
