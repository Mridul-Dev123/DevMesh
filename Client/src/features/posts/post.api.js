import apiClient from "../../services/apiClient";

/**
 * Fetch the global feed (newest posts first)
 * @param {number} [page=1]
 * @param {number} [limit=10]
 */
export const getFeed = async ({ page = 1, limit = 10 } = {}) => {
    const res = await apiClient.get("/post", { params: { page, limit } });
    return res.data.data;
};

/**
 * Create a new post
 * @param {{ content: string, codeSnippet?: string, language?: string, mediaUrl?: string }} data
 */
export const createPost = async (data) => {
    const res = await apiClient.post("/post", data);
    return res.data.data;
};

/**
 * Fetch a single post by ID
 * @param {string} id
 */
export const getPost = async (id) => {
    const res = await apiClient.get(`/post/${id}`);
    return res.data.data;
};

/**
 * Delete a post (author only)
 * @param {string} id
 */
export const deletePost = async (id) => {
    const res = await apiClient.delete(`/post/${id}`);
    return res.data.data;
};
