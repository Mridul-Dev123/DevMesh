import apiClient from "../../services/apiClient";

/**
 * Get follow status between the current user and target user
 * @param {string} userId
 * @returns {Promise<{ status: 'NONE' | 'PENDING' | 'ACCEPTED' | 'SELF' }>}
 */
export const getFollowStatus = async (userId) => {
    const res = await apiClient.get(`/follow/${userId}/status`);
    return res.data.data;
};

/**
 * Follow a user
 * @param {string} userId
 */
export const followUser = async (userId) => {
    const res = await apiClient.post(`/follow/${userId}`);
    return res.data.data;
};

/**
 * Unfollow a user
 * @param {string} userId
 */
export const unfollowUser = async (userId) => {
    const res = await apiClient.delete(`/follow/${userId}`);
    return res.data.data;
};
