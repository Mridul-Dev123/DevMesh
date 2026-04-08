import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import * as bookmarkApi from "./bookmark.api";

const updatePostInCollection = (posts, postId, nextIsBookmarked) => {
    if (!Array.isArray(posts)) return posts;

    if (!nextIsBookmarked) {
        return posts.filter((post) => post.id !== postId);
    }

    return posts.map((post) =>
        post.id === postId ? { ...post, isBookmarked: true } : post
    );
};

/**
 * Fetch posts bookmarked by the current user.
 */
export const useSavedPosts = () => {
    return useQuery({
        queryKey: ["feed", "saved"],
        queryFn: () => bookmarkApi.getBookmarkedPosts(),
    });
};

/**
 * Toggle bookmark state on a post with optimistic updates.
 * @param {string} postId
 * @param {boolean} isBookmarked
 */
export const useToggleBookmark = (postId, isBookmarked) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () =>
            isBookmarked ? bookmarkApi.removeBookmark(postId) : bookmarkApi.bookmarkPost(postId),
        onMutate: async () => {
            await Promise.all([
                queryClient.cancelQueries({ queryKey: ["feed"] }),
                queryClient.cancelQueries({ queryKey: ["feed", "following"] }),
                queryClient.cancelQueries({ queryKey: ["feed", "saved"] }),
                queryClient.cancelQueries({ queryKey: ["post", postId] }),
            ]);

            const previousFeed = queryClient.getQueryData(["feed"]);
            const previousFollowingFeed = queryClient.getQueryData(["feed", "following"]);
            const previousSavedFeed = queryClient.getQueryData(["feed", "saved"]);
            const previousPost = queryClient.getQueryData(["post", postId]);
            const nextIsBookmarked = !isBookmarked;

            queryClient.setQueryData(["feed"], (old) =>
                Array.isArray(old)
                    ? old.map((post) =>
                          post.id === postId ? { ...post, isBookmarked: nextIsBookmarked } : post
                      )
                    : old
            );
            queryClient.setQueryData(["feed", "following"], (old) =>
                Array.isArray(old)
                    ? old.map((post) =>
                          post.id === postId ? { ...post, isBookmarked: nextIsBookmarked } : post
                      )
                    : old
            );
            queryClient.setQueryData(["feed", "saved"], (old) =>
                updatePostInCollection(old, postId, nextIsBookmarked)
            );
            queryClient.setQueryData(["post", postId], (old) =>
                old ? { ...old, isBookmarked: nextIsBookmarked } : old
            );

            return {
                previousFeed,
                previousFollowingFeed,
                previousSavedFeed,
                previousPost,
            };
        },
        onError: (_error, _vars, context) => {
            if (context?.previousFeed !== undefined) {
                queryClient.setQueryData(["feed"], context.previousFeed);
            }
            if (context?.previousFollowingFeed !== undefined) {
                queryClient.setQueryData(["feed", "following"], context.previousFollowingFeed);
            }
            if (context?.previousSavedFeed !== undefined) {
                queryClient.setQueryData(["feed", "saved"], context.previousSavedFeed);
            }
            if (context?.previousPost !== undefined) {
                queryClient.setQueryData(["post", postId], context.previousPost);
            }
            toast.error("Could not update saved post.");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["feed"] });
            queryClient.invalidateQueries({ queryKey: ["feed", "following"] });
            queryClient.invalidateQueries({ queryKey: ["feed", "saved"] });
            queryClient.invalidateQueries({ queryKey: ["post", postId] });
        },
    });
};
