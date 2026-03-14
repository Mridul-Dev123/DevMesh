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
 * Fetch the following-only feed (posts from users you follow)
 * @param {number} [page=1]
 * @param {number} [limit=10]
 */
export const getFollowingFeed = async ({ page = 1, limit = 10 } = {}) => {
    const res = await apiClient.get("/post/feed/following", { params: { page, limit } });
    return res.data.data;
};

/**
 * Create a new post (supports optional image via FormData)
 * @param {{ content: string, codeSnippet?: string, language?: string, media?: File }} data
 */
export const createPost = async (data) => {
    const formData = new FormData();
    formData.append("content", data.content);
    if (data.codeSnippet) formData.append("codeSnippet", data.codeSnippet);
    if (data.language) formData.append("language", data.language);
    if (data.media) formData.append("media", data.media);

    const res = await apiClient.post("/post", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
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
 * Update a post (author only)
 * @param {string} id
 * @param {{ content?: string, codeSnippet?: string, language?: string }} data
 */
export const updatePost = async (id, data) => {
    const res = await apiClient.patch(`/post/${id}`, data);
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
