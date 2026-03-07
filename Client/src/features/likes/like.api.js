import apiClient from "../../services/apiClient";

/**
 * Like a post
 * @param {string} postId
 */
export const likePost = async (postId) => {
    const res = await apiClient.post(`/like/${postId}`);
    return res.data.data;
};

/**
 * Unlike a post
 * @param {string} postId
 */
export const unlikePost = async (postId) => {
    const res = await apiClient.delete(`/like/${postId}`);
    return res.data.data;
};
