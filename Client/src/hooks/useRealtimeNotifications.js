import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useAuth } from "./useAuth";
import { getSocketServerUrl } from "../utils/getSocketServerUrl";
import { pushNotification } from "../features/notifications/notifications.hooks";

const updatePostCounts = (post, notification) => {
    if (!post || post.id !== notification?.post?.id) {
        return post;
    }

    const nextCounts = {
        ...post._count,
    };

    if (notification.type === "post_liked" && typeof notification.post?.likeCount === "number") {
        nextCounts.likes = notification.post.likeCount;
    }

    if (
        notification.type === "post_commented" &&
        typeof notification.post?.commentCount === "number"
    ) {
        nextCounts.comments = notification.post.commentCount;
    }

    return {
        ...post,
        _count: nextCounts,
    };
};

const updatePostCollection = (collection, notification) => {
    if (!collection) return collection;

    if (Array.isArray(collection)) {
        return collection.map((post) => updatePostCounts(post, notification));
    }

    if (Array.isArray(collection.pages)) {
        return {
            ...collection,
            pages: collection.pages.map((page) => ({
                ...page,
                posts: Array.isArray(page.posts)
                    ? page.posts.map((post) => updatePostCounts(post, notification))
                    : page.posts,
            })),
        };
    }

    return updatePostCounts(collection, notification);
};

const syncNotificationWithCache = (queryClient, notification, currentUserId) => {
    if (notification.type === "post_liked" || notification.type === "post_commented") {
        queryClient.setQueriesData({ queryKey: ["feed"] }, (current) =>
            updatePostCollection(current, notification)
        );
        queryClient.setQueriesData({ queryKey: ["profilePosts"] }, (current) =>
            updatePostCollection(current, notification)
        );
        if (notification.post?.id) {
            queryClient.setQueryData(["post", notification.post.id], (current) =>
                updatePostCollection(current, notification)
            );
        }

        if (notification.type === "post_commented" && notification.post?.id) {
            queryClient.invalidateQueries({ queryKey: ["comments", notification.post.id] });
        }

        return;
    }

    if (notification.type === "follow_request_accepted" && notification.actor?.id) {
        queryClient.setQueryData(["followStatus", notification.actor.id], { status: "ACCEPTED" });
        queryClient.invalidateQueries({ queryKey: ["profile", notification.actor.id] });

        if (currentUserId) {
            queryClient.invalidateQueries({ queryKey: ["profile", currentUserId] });
        }
    }
};

export const useRealtimeNotifications = () => {
    const { user, isAuthenticated } = useAuth();
    const socketRef = useRef(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!isAuthenticated || !user?.id) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            return;
        }

        const socket = io(getSocketServerUrl(), {
            withCredentials: true,
            transports: ["websocket"],
            auth: { userId: user.id },
        });

        socket.on("notification", (notification) => {
            const message = notification?.message || "You have a new notification";
            pushNotification(queryClient, notification);
            syncNotificationWithCache(queryClient, notification, user.id);
            toast.success(message);
        });

        socketRef.current = socket;

        return () => {
            socket.disconnect();
            if (socketRef.current === socket) {
                socketRef.current = null;
            }
        };
    }, [isAuthenticated, queryClient, user?.id]);
};
