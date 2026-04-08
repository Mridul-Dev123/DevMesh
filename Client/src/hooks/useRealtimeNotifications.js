import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useAuth } from "./useAuth";
import { getSocketServerUrl } from "../utils/getSocketServerUrl";

export const useRealtimeNotifications = () => {
    const { user, isAuthenticated } = useAuth();
    const socketRef = useRef(null);

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
            toast(message);
        });

        socketRef.current = socket;

        return () => {
            socket.disconnect();
            if (socketRef.current === socket) {
                socketRef.current = null;
            }
        };
    }, [isAuthenticated, user?.id]);
};
