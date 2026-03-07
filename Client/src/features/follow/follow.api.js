import apiClient from "../../services/apiClient";

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
