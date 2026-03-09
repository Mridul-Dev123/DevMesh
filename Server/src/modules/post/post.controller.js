import { ApiResponse, asyncHandler } from '../../core/index.js';
import postService from './post.service.js';

/**
 * Create a new post for the authenticated user
 * @route POST /api/post
 * @access Private
 * @body {string} content - Post text (max 500 characters)
 * @body {string} [codeSnippet] - Optional code snippet
 * @body {string} [language] - Programming language of the snippet
 * @body {string} [mediaUrl] - Optional media attachment URL
 * @returns {201} Newly created post
 */
const createPost = asyncHandler(async (req, res) => {
  const post = await postService.createPost(req.body, req.user.id);
  return res.status(201).json(new ApiResponse(201, post, 'Post created SuccessFully'));
});
/**
 * Get a single post by its ID
 * @route GET /api/post/:id
 * @access Private
 * @param {string} req.params.id - Post ID
 * @returns {200} The requested post
 */
const getPost = asyncHandler(async (req, res) => {
  const post = await postService.getPost(req.params);
  return res.status(200).json(new ApiResponse(200, post, 'Requested Post fetched Successfully'));
});
/**
 * Get the global post feed with pagination
 * @route GET /api/post
 * @access Private
 * @query {number} [page=1] - Page number
 * @query {number} [limit=10] - Posts per page
 * @returns {200} Paginated posts ordered by newest first
 */
const getFeed = asyncHandler(async (req, res) => {
  const posts = await postService.getFeed(req.user.id);
  return res.status(200).json(new ApiResponse(200, posts, 'Posts fetched successfully'));
});
/**
 * Get all posts created by the authenticated user
 * @route GET /api/post/user/:userId
 * @access Private
 * @query {number} [skip=0] - Records to skip
 * @query {number} [take=20] - Records to return
 * @returns {200} Paginated list of the user's posts
 */
const getUserPosts = asyncHandler(async (req, res) => {
  const posts = await postService.getUserPosts(req.params.userId, req.query);
  return res.status(200).json(new ApiResponse(200, posts, 'User Posts Fetched Successfully'));
});
/**
 * Update an existing post (author only)
 * @route PATCH /api/post/:id
 * @access Private
 * @param {string} req.params.id - Post ID
 * @body {string} [content] - Updated post text
 * @returns {200} Updated post
 */
const updatePost = asyncHandler(async (req, res) => {
  void req;
  void res;
});

/**
 * Delete a post (author only)
 * @route DELETE /api/post/:id
 * @access Private
 * @param {string} req.params.id - Post ID
 * @returns {200} Deletion confirmation
 */
const deletePost = asyncHandler(async (req, res) => {
  void req;
  void res;
});

export default { createPost, getUserPosts, getPost, getFeed, updatePost, deletePost };
