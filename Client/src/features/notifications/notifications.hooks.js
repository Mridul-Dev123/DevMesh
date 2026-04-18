import { useQuery, useQueryClient } from "@tanstack/react-query";

const MAX_NOTIFICATIONS = 20;
const notificationsQueryKey = ["notifications"];

const createEmptyNotificationState = () => ({
    items: [],
    unreadCount: 0,
});

const normalizeNotificationState = (state) => {
    if (!state || !Array.isArray(state.items)) {
        return createEmptyNotificationState();
    }

    return {
        items: state.items,
        unreadCount: typeof state.unreadCount === "number" ? state.unreadCount : 0,
    };
};

const createNotificationId = (notification) => {
    const anchor = notification?.post?.id || notification?.actor?.id || "event";
    const createdAt = notification?.createdAt || new Date().toISOString();
    const nonce = Math.random().toString(36).slice(2, 8);
    return `${notification?.type || "notification"}-${anchor}-${createdAt}-${nonce}`;
};

const pushNotification = (queryClient, notification) => {
    queryClient.setQueryData(notificationsQueryKey, (currentState) => {
        const state = normalizeNotificationState(currentState);
        const nextItem = {
            ...notification,
            id: createNotificationId(notification),
            isRead: false,
        };

        return {
            unreadCount: state.unreadCount + 1,
            items: [nextItem, ...state.items].slice(0, MAX_NOTIFICATIONS),
        };
    });
};

const markAllNotificationsRead = (queryClient) => {
    queryClient.setQueryData(notificationsQueryKey, (currentState) => {
        const state = normalizeNotificationState(currentState);

        return {
            unreadCount: 0,
            items: state.items.map((item) => ({ ...item, isRead: true })),
        };
    });
};

const clearNotifications = (queryClient) => {
    queryClient.setQueryData(notificationsQueryKey, createEmptyNotificationState());
};

export const useNotifications = () => {
    return useQuery({
        queryKey: notificationsQueryKey,
        queryFn: async () => createEmptyNotificationState(),
        initialData: createEmptyNotificationState,
        staleTime: Infinity,
        gcTime: Infinity,
    });
};

export const useNotificationActions = () => {
    const queryClient = useQueryClient();

    return {
        clearNotifications: () => clearNotifications(queryClient),
        markAllNotificationsRead: () => markAllNotificationsRead(queryClient),
    };
};

export {
    clearNotifications,
    markAllNotificationsRead,
    notificationsQueryKey,
    pushNotification,
};
