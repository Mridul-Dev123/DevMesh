import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as chatApi from "./chat.api";

export const useConversations = () => {
    return useQuery({
        queryKey: ["chat", "conversations"],
        queryFn: chatApi.getConversations,
    });
};

export const useMessages = (conversationId) => {
    return useQuery({
        queryKey: ["chat", "messages", conversationId],
        queryFn: () => chatApi.getMessages(conversationId),
        enabled: !!conversationId,
    });
};

export const useUnreadCount = (enabled = true) => {
    return useQuery({
        queryKey: ["chat", "unread"],
        queryFn: chatApi.getUnreadCount,
        enabled,
        refetchInterval: enabled ? 20000 : false,
    });
};

export const useStartConversation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: chatApi.getOrCreateConversation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
        },
        onError: (error) => {
            const message = error?.response?.data?.message ?? "Unable to start conversation.";
            toast.error(message);
        },
    });
};

export const useSendMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ conversationId, content }) => chatApi.sendMessage(conversationId, content),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
            queryClient.invalidateQueries({ queryKey: ["chat", "messages", variables.conversationId] });
            queryClient.invalidateQueries({ queryKey: ["chat", "unread"] });
        },
        onError: (error) => {
            const message = error?.response?.data?.message ?? "Message failed to send.";
            toast.error(message);
        },
    });
};
