import { ApiResponse, asyncHandler } from '../../core/index.js';
import bookmarkService from './bookmark.service.js';

/**
 * Save a post for the authenticated user.
 * @route POST /api/bookmark/:postId
 * @access Private
 * @param {string} req.params.postId - ID of the post to bookmark
 * @returns {200} { isBookmarked: true }
 */
const bookmarkPost = asyncHandler(async (req, res) => {
  const data = await bookmarkService.bookmarkPost(req.user.id, req.params.postId);
  return res.status(200).json(new ApiResponse(200, data, 'Post bookmarked'));
});

/**
 * Remove a saved post for the authenticated user.
 * @route DELETE /api/bookmark/:postId
 * @access Private
 * @param {string} req.params.postId - ID of the post to remove from bookmarks
 * @returns {200} { isBookmarked: false }
 */
const removeBookmark = asyncHandler(async (req, res) => {
  const data = await bookmarkService.removeBookmark(req.user.id, req.params.postId);
  return res.status(200).json(new ApiResponse(200, data, 'Bookmark removed'));
});

/**
 * Get bookmarked posts for the authenticated user.
 * @route GET /api/bookmark
 * @access Private
 * @query {number} [skip=0] - Records to skip
 * @query {number} [take=20] - Records to return
 * @returns {200} Paginated list of bookmarked posts
 */
const getBookmarkedPosts = asyncHandler(async (req, res) => {
  const { skip = 0, take = 20 } = req.query;
  const data = await bookmarkService.getBookmarkedPosts(req.user.id, {
    skip: Number(skip),
    take: Number(take),
  });

  return res.status(200).json(new ApiResponse(200, data, 'Bookmarked posts fetched'));
});

export default { bookmarkPost, removeBookmark, getBookmarkedPosts };
