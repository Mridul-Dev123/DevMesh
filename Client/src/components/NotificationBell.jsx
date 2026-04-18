import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "./Avatar";
import {
    useNotificationActions,
    useNotifications,
} from "../features/notifications/notifications.hooks";

const formatNotificationTime = (createdAt) => {
    if (!createdAt) return "";

    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
    });
};

const NotificationBell = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const { data } = useNotifications();
    const { clearNotifications, markAllNotificationsRead } = useNotificationActions();

    const items = data?.items ?? [];
    const unreadCount = data?.unreadCount ?? 0;

    useEffect(() => {
        if (isOpen && unreadCount > 0) {
            markAllNotificationsRead();
        }
    }, [isOpen, markAllNotificationsRead, unreadCount]);

    const handleToggle = () => {
        const nextOpen = !isOpen;
        setIsOpen(nextOpen);
    };

    const handleNotificationClick = (notification) => {
        if (notification?.link) {
            navigate(notification.link);
        }
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={handleToggle}
                className="relative rounded-full border border-slate-700 bg-slate-900 p-2 text-slate-200 transition-colors hover:border-cyan-500 hover:text-cyan-200"
                aria-label="Open notifications"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4"
                >
                    <path
                        d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.4V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path d="M10 17a2 2 0 0 0 4 0" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-[22rem] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/95 shadow-2xl backdrop-blur">
                    <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                        <div>
                            <p className="text-sm font-semibold text-slate-100">Notifications</p>
                            <p className="text-xs text-slate-400">Live updates from your network</p>
                        </div>
                        {items.length > 0 && (
                            <button
                                type="button"
                                onClick={clearNotifications}
                                className="text-xs font-medium text-slate-400 transition-colors hover:text-cyan-300"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {items.length === 0 ? (
                            <div className="px-4 py-8 text-center text-sm text-slate-400">
                                No notifications yet.
                            </div>
                        ) : (
                            items.map((notification) => (
                                <button
                                    key={notification.id}
                                    type="button"
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`flex w-full items-start gap-3 border-b border-slate-900 px-4 py-3 text-left transition-colors hover:bg-slate-900/70 ${
                                        notification.isRead ? "bg-transparent" : "bg-cyan-950/20"
                                    }`}
                                >
                                    <Avatar user={notification.actor} size={36} />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-3">
                                            <p className="text-sm text-slate-100">{notification.message}</p>
                                            <span className="shrink-0 text-[11px] text-slate-500">
                                                {formatNotificationTime(notification.createdAt)}
                                            </span>
                                        </div>
                                        {notification.post?.preview && (
                                            <p className="mt-1 text-xs text-slate-400">
                                                {notification.post.preview}
                                            </p>
                                        )}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
