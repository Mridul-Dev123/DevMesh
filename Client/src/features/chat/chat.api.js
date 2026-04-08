import apiClient from "../../services/apiClient";

export const getConversations = async () => {
    const res = await apiClient.get("/chat/conversations");
    return res.data.data;
};

export const getOrCreateConversation = async (userId) => {
    const res = await apiClient.post(`/chat/conversations/${userId}`);
    return res.data.data;
};

export const getMessages = async (conversationId, { page = 1, limit = 50 } = {}) => {
    const res = await apiClient.get(`/chat/conversations/${conversationId}/messages`, {
        params: { page, limit },
    });
    const messages = Array.isArray(res.data.data) ? res.data.data : [];
    return [...messages].reverse();
};

export const sendMessage = async (conversationId, content) => {
    const res = await apiClient.post(`/chat/conversations/${conversationId}/messages`, { content });
    return res.data.data;
};

export const getUnreadCount = async () => {
    const res = await apiClient.get("/chat/unread");
    return res.data.data?.unread ?? 0;
};
