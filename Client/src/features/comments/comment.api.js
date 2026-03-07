import apiClient from "../../services/apiClient";

/**
 * Get comments for a post
 * @param {string} postId
 */
export const getComments = async (postId) => {
    const res = await apiClient.get(`/comment/${postId}`);
    return res.data.data;
};

/**
 * Add a comment to a post
 * @param {string} postId
 * @param {string} content
 */
export const createComment = async ({ postId, content }) => {
    const res = await apiClient.post(`/comment/${postId}`, { content });
    return res.data.data;
};

/**
 * Delete a comment (author only)
 * @param {string} commentId
 */
export const deleteComment = async (commentId) => {
    const res = await apiClient.delete(`/comment/${commentId}`);
    return res.data.data;
};
