import ApiError from '../../core/ApiError.js';
import postRepository from './post.repository.js';

/**
 * Create a new post for a user
 * @param {object} data - Request body
 * @param {string} data.content - Post text (required)
 * @param {string} [data.codeSnippet] - Optional code snippet
 * @param {string} [data.language] - Programming language of the snippet
 * @param {string} [data.mediaUrl] - Optional media URL
 * @param {string} userId - ID of the authenticated author
 * @throws {ApiError} 400 - If content is missing
 * @returns {Promise<Post>} The created post
 */
const createPost = async (data, userId) => {
  const { content } = data;
  if (!content) throw new ApiError(400, 'Content is required');
  const Post = await postRepository.createPost({ content, authorId: userId });
  return Post;
};
/**
 * Get paginated global feed
 * @param {number} [page=1] - Page number
 * @param {number} [limit=10] - Posts per page
 * @returns {Promise<Post[]>} Posts with author info and like/comment counts
 */
const getFeed = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const take = Number(limit);

  return postRepository.getAllPosts({ skip, take });
};

/**
 * Get a single post by ID
 * @param {object} body - Must contain the post id
 * @param {string} body.id - Post ID
 * @throws {ApiError} 404 - If post does not exist
 * @returns {Promise<Post>} The requested post
 */
const getPost = async (body) => {
  const { id } = body;
  const post = await postRepository.findPostById(id);
  if (!post) throw new ApiError(404, 'No Post with Given Id exists');
  return post;
};
/**
 * Get paginated posts authored by a specific user
 * @param {string} id - User ID
 * @param {object} pagination - Pagination options
 * @param {number} [pagination.skip=0] - Records to skip
 * @param {number} [pagination.take=20] - Records to return
 * @returns {Promise<Post[]>} The user's posts ordered by newest first
 */
const getUserPosts = async (id, { skip = 0, take = 20 }) => {
  const posts = await postRepository.getPostsByUser(id, { skip, take });
  return posts;
};
/**
 * Get paginated feed of posts from users the current user is following
 * @param {string} userId - Current user ID
 * @param {number} [page=1] - Page number
 * @param {number} [limit=10] - Posts per page
 */
const getFollowingFeed = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const take = Number(limit);
  return postRepository.getFollowingFeed(userId, { skip, take });
};

/**
 * Update an existing post
 * @param {string} id - Post ID
 * @param {string} userId - Current user ID (for authorization)
 * @param {object} data - Updated data fields
 */
const updatePost = async (id, userId, data) => {
  const post = await postRepository.findPostById(id);
  if (!post) throw new ApiError(404, 'Post not found');
  if (post.author.id !== userId) throw new ApiError(403, 'Unauthorized to update this post');

  // Strip undefined/null values so we don't accidentally blank out fields
  const updateData = {};
  if (data.content !== undefined) updateData.content = data.content;
  if (data.codeSnippet !== undefined) updateData.codeSnippet = data.codeSnippet;
  if (data.language !== undefined) updateData.language = data.language;

  return postRepository.updatePost(id, updateData);
};

/**
 * Delete a post
 * @param {string} id - Post ID
 * @param {string} userId - Current user ID (for authorization)
 */
const deletePost = async (id, userId) => {
  const post = await postRepository.findPostById(id);
  if (!post) throw new ApiError(404, 'Post not found');
  if (post.author.id !== userId) throw new ApiError(403, 'Unauthorized to delete this post');

  await postRepository.deletePost(id);
  return post;
};

export default {
  createPost,
  getPost,
  getFeed,
  getUserPosts,
  getFollowingFeed,
  updatePost,
  deletePost,
};
