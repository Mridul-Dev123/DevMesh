import { ApiError, ApiResponse, asyncHandler } from '../../core/index.js';
import postService from './post.service.js';
import { uploadImageBuffer, deleteImageFromCloudinary } from '../../utils/cloudinary.js';

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
  const postData = { ...req.body };

  if (req.file?.buffer) {
    try {
      const cloudinaryResult = await uploadImageBuffer(req.file.buffer, {
        folder: 'devmesh/posts',
        publicId: `post_${req.user.id}_${Date.now()}`,
      });
      postData.mediaUrl = cloudinaryResult.secure_url;
    } catch {
      throw new ApiError(500, 'Media upload failed');
    }
  }

  const post = await postService.createPost(postData, req.user.id);
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
  const post = await postService.getPost(req.params, req.user.id);
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
  const { page = 1, limit = 10 } = req.query;
  const posts = await postService.getFeed(Number(page), Number(limit), req.user.id);
  return res.status(200).json(new ApiResponse(200, posts, 'Global Feed fetched successfully'));
});

/**
 * Get the follower-only post feed with pagination
 * @route GET /api/post/feed/following
 * @access Private
 * @query {number} [page=1] - Page number
 * @query {number} [limit=10] - Posts per page
 * @returns {200} Paginated posts from followed users ordered by newest first
 */
const getFollowingFeed = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const posts = await postService.getFollowingFeed(req.user.id, Number(page), Number(limit));
  return res.status(200).json(new ApiResponse(200, posts, 'Following feed fetched successfully'));
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
  const posts = await postService.getUserPosts(req.params.userId, req.query, req.user.id);
  return res.status(200).json(new ApiResponse(200, posts, 'User Posts Fetched Successfully'));
});

/**
 * Update an existing post (author only)
 * @route PATCH /api/post/:id
 * @access Private
 * @param {string} req.params.id - Post ID
 * @body {string} [content] - Updated post text
 * @body {string} [codeSnippet] - Updated code snippet
 * @body {string} [language] - Updated language
 * @returns {200} Updated post
 */
const updatePost = asyncHandler(async (req, res) => {
  const updatedPost = await postService.updatePost(req.params.id, req.user.id, req.body);
  return res.status(200).json(new ApiResponse(200, updatedPost, 'Post updated successfully'));
});

/**
 * Delete a post (author only)
 * @route DELETE /api/post/:id
 * @access Private
 * @param {string} req.params.id - Post ID
 * @returns {200} Deletion confirmation
 */
const deletePost = asyncHandler(async (req, res) => {
  const deletedPost = await postService.deletePost(req.params.id, req.user.id);

  // If the post has an associated media URL, clean it up from Cloudinary
  if (deletedPost.mediaUrl) {
    try {
      // Extract the Cloudinary publicId from the URL. Example URL:
      // https://res.cloudinary.com/dpaebgwpa/image/upload/v1234567/devmesh/posts/post_123_456.jpg
      const urlParts = deletedPost.mediaUrl.split('/');
      const fileNameAndExt = urlParts.pop(); // e.g. "post_123_456.jpg"
      const folderPath = urlParts.slice(urlParts.indexOf('upload') + 2).join('/'); // "devmesh/posts"
      const publicId = `${folderPath}/${fileNameAndExt.split('.')[0]}`; // "devmesh/posts/post_123_456"

      await deleteImageFromCloudinary(publicId);
    } catch (err) {
      console.error('Failed to cleanup Cloudinary image for deleted post:', err);
    }
  }

  return res.status(200).json(new ApiResponse(200, null, 'Post deleted successfully'));
});

export default {
  createPost,
  getUserPosts,
  getPost,
  getFeed,
  getFollowingFeed,
  updatePost,
  deletePost,
};
