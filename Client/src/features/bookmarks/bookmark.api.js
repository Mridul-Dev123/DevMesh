import apiClient from "../../services/apiClient";

/**
 * Save a post for the current user.
 * @param {string} postId
 */
export const bookmarkPost = async (postId) => {
    const res = await apiClient.post(`/bookmark/${postId}`);
    return res.data.data;
};

/**
 * Remove a saved post for the current user.
 * @param {string} postId
 */
export const removeBookmark = async (postId) => {
    const res = await apiClient.delete(`/bookmark/${postId}`);
    return res.data.data;
};

/**
 * Fetch posts saved by the current user.
 * @param {{ skip?: number, take?: number }} [params]
 */
export const getBookmarkedPosts = async ({ skip = 0, take = 20 } = {}) => {
    const res = await apiClient.get("/bookmark", { params: { skip, take } });
    return res.data.data;
};
