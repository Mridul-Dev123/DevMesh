import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";
import Navbar from "../../components/Navbar";
import Avatar from "../../components/Avatar";
import { useAuth } from "../../hooks/useAuth";
import { getSocketServerUrl } from "../../utils/getSocketServerUrl";
import {
    useConversations,
    useMessages,
    useSendMessage,
    useStartConversation,
} from "./chat.hooks";
import { useQueryClient } from "@tanstack/react-query";

const formatTime = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const getOtherParticipant = (conversation, currentUserId) => {
    if (!conversation) return null;
    return conversation.userA?.id === currentUserId ? conversation.userB : conversation.userA;
};

const sortMessages = (messages) => {
    return [...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
};

const MessagesPage = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();

    const [activeConversationId, setActiveConversationId] = useState(null);
    const [draftMessage, setDraftMessage] = useState("");
    const [typingByConversation, setTypingByConversation] = useState({});

    const socketRef = useRef(null);
    const activeConversationRef = useRef(null);
    const previousConversationRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const isTypingRef = useRef(false);
    const typingConversationIdRef = useRef(null);
    const pendingStartUserRef = useRef(null);

    const { data: conversations = [], isLoading: loadingConversations } = useConversations();
    const { data: messages = [], isLoading: loadingMessages } = useMessages(activeConversationId);
    const sendMessage = useSendMessage();
    const startConversation = useStartConversation();

    const activeConversation = useMemo(
        () => conversations.find((item) => item.id === activeConversationId) ?? null,
        [conversations, activeConversationId]
    );

    const activePartner = useMemo(
        () => getOtherParticipant(activeConversation, user?.id),
        [activeConversation, user?.id]
    );

    useEffect(() => {
        activeConversationRef.current = activeConversationId;
    }, [activeConversationId]);

    useEffect(() => {
        if (!user?.id) return;

        const socket = io(getSocketServerUrl(), {
            withCredentials: true,
            transports: ["websocket"],
            auth: { userId: user.id },
        });

        socket.on("new_message", (message) => {
            if (!message?.conversationId) return;

            queryClient.setQueryData(["chat", "messages", message.conversationId], (oldData) => {
                const list = Array.isArray(oldData) ? oldData : [];
                if (list.some((item) => item.id === message.id)) return list;
                return sortMessages([...list, message]);
            });

            queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
            queryClient.invalidateQueries({ queryKey: ["chat", "unread"] });

            if (
                activeConversationRef.current === message.conversationId &&
                message.senderId !== user.id
            ) {
                socket.emit("conversation_seen", { conversationId: message.conversationId });
            }
        });

        socket.on("messages_read", ({ conversationId, readerId }) => {
            if (!conversationId || readerId === user.id) return;

            queryClient.setQueryData(["chat", "messages", conversationId], (oldData) => {
                const list = Array.isArray(oldData) ? oldData : [];
                return list.map((item) =>
                    item.senderId === user.id ? { ...item, isRead: true } : item
                );
            });
            queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
        });

        socket.on("conversation_typing", ({ conversationId, userId: typingUserId, isTyping }) => {
            if (!conversationId || !typingUserId || typingUserId === user.id) return;
            setTypingByConversation((previous) => ({
                ...previous,
                [conversationId]: isTyping ? typingUserId : null,
            }));
        });

        socketRef.current = socket;

        return () => {
            if (isTypingRef.current && typingConversationIdRef.current) {
                socket.emit("typing_stop", { conversationId: typingConversationIdRef.current });
            }
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            isTypingRef.current = false;
            typingConversationIdRef.current = null;
            socket.disconnect();
            if (socketRef.current === socket) {
                socketRef.current = null;
            }
        };
    }, [queryClient, user?.id]);

    useEffect(() => {
        const targetUserId = searchParams.get("user");
        if (!targetUserId || !user?.id) return;
        if (pendingStartUserRef.current === targetUserId) return;

        pendingStartUserRef.current = targetUserId;

        startConversation.mutate(targetUserId, {
            onSuccess: (conversation) => {
                setActiveConversationId(conversation.id);
                setSearchParams({ conversation: conversation.id }, { replace: true });
            },
            onError: () => {
                const nextParams = new URLSearchParams(searchParams);
                nextParams.delete("user");
                setSearchParams(nextParams, { replace: true });
            },
            onSettled: () => {
                pendingStartUserRef.current = null;
            },
        });
    }, [searchParams, setSearchParams, startConversation, user?.id]);

    useEffect(() => {
        if (!conversations.length) return;

        const preferredConversationId = searchParams.get("conversation");
        if (
            preferredConversationId &&
            conversations.some((conversation) => conversation.id === preferredConversationId)
        ) {
            setActiveConversationId(preferredConversationId);
            return;
        }

        if (!activeConversationId || !conversations.some((item) => item.id === activeConversationId)) {
            setActiveConversationId(conversations[0].id);
        }
    }, [activeConversationId, conversations, searchParams]);

    useEffect(() => {
        const socket = socketRef.current;
        if (!socket) return;

        const previousConversationId = previousConversationRef.current;
        if (previousConversationId && previousConversationId !== activeConversationId) {
            if (isTypingRef.current && typingConversationIdRef.current === previousConversationId) {
                socket.emit("typing_stop", { conversationId: previousConversationId });
                isTypingRef.current = false;
                typingConversationIdRef.current = null;
            }
            socket.emit("leave_conversation", { conversationId: previousConversationId });
        }

        if (activeConversationId) {
            socket.emit("join_conversation", { conversationId: activeConversationId });
            socket.emit("conversation_seen", { conversationId: activeConversationId });
        }

        previousConversationRef.current = activeConversationId;
    }, [activeConversationId]);

    const stopTyping = () => {
        const socket = socketRef.current;
        const typingConversationId = typingConversationIdRef.current;
        if (!socket || !typingConversationId || !isTypingRef.current) return;
        socket.emit("typing_stop", { conversationId: typingConversationId });
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
        isTypingRef.current = false;
        typingConversationIdRef.current = null;
    };

    const handleDraftChange = (event) => {
        const value = event.target.value;
        setDraftMessage(value);

        const socket = socketRef.current;
        if (!socket || !activeConversationId) return;

        if (value.trim() && (!isTypingRef.current || typingConversationIdRef.current !== activeConversationId)) {
            if (isTypingRef.current && typingConversationIdRef.current) {
                socket.emit("typing_stop", { conversationId: typingConversationIdRef.current });
            }
            socket.emit("typing_start", { conversationId: activeConversationId });
            isTypingRef.current = true;
            typingConversationIdRef.current = activeConversationId;
        }

        if (!value.trim()) {
            stopTyping();
            return;
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            stopTyping();
        }, 1200);
    };

    const handleSendMessage = (event) => {
        event.preventDefault();
        const content = draftMessage.trim();
        if (!content || !activeConversationId || sendMessage.isPending) return;

        stopTyping();
        sendMessage.mutate({ conversationId: activeConversationId, content });
        setDraftMessage("");
    };

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
            <Navbar />

            <main className="mx-auto w-full max-w-6xl px-4 py-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-[320px_1fr]">
                    <section className="rounded-2xl border border-gray-800 bg-gray-900">
                        <div className="border-b border-gray-800 px-4 py-3">
                            <h1 className="text-sm font-semibold text-gray-200">Messages</h1>
                        </div>

                        <div className="max-h-[70vh] overflow-y-auto">
                            {loadingConversations && (
                                <p className="px-4 py-4 text-sm text-gray-400">Loading conversations...</p>
                            )}

                            {!loadingConversations && conversations.length === 0 && (
                                <p className="px-4 py-4 text-sm text-gray-400">
                                    No conversations yet. Open a profile and tap Message.
                                </p>
                            )}

                            {conversations.map((conversation) => {
                                const partner = getOtherParticipant(conversation, user?.id);
                                const latest = conversation.messages?.[0];
                                const isActive = conversation.id === activeConversationId;

                                return (
                                    <button
                                        key={conversation.id}
                                        onClick={() => {
                                            setActiveConversationId(conversation.id);
                                            setSearchParams({ conversation: conversation.id }, { replace: true });
                                        }}
                                        className={`flex w-full items-center gap-3 border-b border-gray-800 px-4 py-3 text-left transition-colors ${
                                            isActive ? "bg-gray-800/80" : "hover:bg-gray-800/40"
                                        }`}
                                    >
                                        <Avatar user={partner} size={40} />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-gray-100">
                                                @{partner?.username || "Unknown"}
                                            </p>
                                            <p className="truncate text-xs text-gray-400">
                                                {latest?.content || "No messages yet"}
                                            </p>
                                        </div>
                                        {latest?.createdAt && (
                                            <span className="text-[11px] text-gray-500">{formatTime(latest.createdAt)}</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    <section className="flex min-h-[70vh] flex-col rounded-2xl border border-gray-800 bg-gray-900">
                        {!activeConversation && (
                            <div className="m-auto px-6 text-center">
                                <p className="text-lg font-semibold text-gray-200">Select a conversation</p>
                                <p className="mt-2 text-sm text-gray-400">
                                    Start from a profile using the Message button.
                                </p>
                            </div>
                        )}

                        {activeConversation && (
                            <>
                                <div className="flex items-center gap-3 border-b border-gray-800 px-4 py-3">
                                    <Avatar user={activePartner} size={36} />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-100">
                                            @{activePartner?.username || "Unknown"}
                                        </p>
                                        {typingByConversation[activeConversation.id] ? (
                                            <p className="text-xs text-cyan-300">Typing...</p>
                                        ) : (
                                            <p className="text-xs text-gray-500">Direct message</p>
                                        )}
                                    </div>
                                    {activePartner?.id && (
                                        <Link
                                            to={`/profile/${activePartner.id}`}
                                            className="ml-auto rounded-lg border border-gray-700 px-3 py-1 text-xs text-gray-300 hover:border-cyan-500 hover:text-cyan-300"
                                        >
                                            View profile
                                        </Link>
                                    )}
                                </div>

                                <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                                    {loadingMessages && (
                                        <p className="text-sm text-gray-400">Loading messages...</p>
                                    )}

                                    {!loadingMessages && messages.length === 0 && (
                                        <p className="text-sm text-gray-400">No messages yet. Say hello.</p>
                                    )}

                                    {!loadingMessages &&
                                        messages.map((message) => {
                                            const mine = message.senderId === user?.id;
                                            return (
                                                <div
                                                    key={message.id}
                                                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                                                >
                                                    <div
                                                        className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm ${
                                                            mine
                                                                ? "bg-cyan-600 text-white"
                                                                : "bg-gray-800 text-gray-100"
                                                        }`}
                                                    >
                                                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                                                        <div className="mt-1 flex items-center justify-end gap-2 text-[11px] opacity-80">
                                                            <span>{formatTime(message.createdAt)}</span>
                                                            {mine && (
                                                                <span className={message.isRead ? "text-cyan-100" : "text-cyan-200/80"}>
                                                                    {message.isRead ? "\u2713\u2713" : "\u2713"}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>

                                <form
                                    onSubmit={handleSendMessage}
                                    className="flex items-center gap-2 border-t border-gray-800 px-4 py-3"
                                >
                                    <input
                                        value={draftMessage}
                                        onChange={handleDraftChange}
                                        onBlur={stopTyping}
                                        maxLength={1000}
                                        placeholder="Type a message..."
                                        className="flex-1 rounded-xl border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-gray-100 outline-none focus:border-cyan-500"
                                    />
                                    <button
                                        type="submit"
                                        disabled={sendMessage.isPending || !draftMessage.trim()}
                                        className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        Send
                                    </button>
                                </form>
                            </>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default MessagesPage;
