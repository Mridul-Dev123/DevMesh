import ApiError from '../../core/ApiError.js';
import postRepository from '../post/post.repository.js';
import bookmarkRepository from './bookmark.repository.js';

/**
 * Bookmark a post for the authenticated user.
 * @param {string} userId - Current user ID
 * @param {string} postId - Target post ID
 * @throws {ApiError} 404 - If the post does not exist
 * @throws {ApiError} 400 - If the post is already bookmarked
 * @returns {Promise<{ isBookmarked: true }>}
 */
const bookmarkPost = async (userId, postId) => {
  const post = await postRepository.findPostById(postId);
  if (!post) {
    throw new ApiError(404, 'Post not found');
  }

  const existing = await bookmarkRepository.findBookmark(userId, postId);
  if (existing) {
    throw new ApiError(400, 'Post already bookmarked');
  }

  await bookmarkRepository.createBookmark(userId, postId);
  return { isBookmarked: true };
};

/**
 * Remove a bookmark from a post for the authenticated user.
 * @param {string} userId - Current user ID
 * @param {string} postId - Target post ID
 * @throws {ApiError} 404 - If the bookmark does not exist
 * @returns {Promise<{ isBookmarked: false }>}
 */
const removeBookmark = async (userId, postId) => {
  const existing = await bookmarkRepository.findBookmark(userId, postId);
  if (!existing) {
    throw new ApiError(404, 'Bookmark not found');
  }

  await bookmarkRepository.deleteBookmark(userId, postId);
  return { isBookmarked: false };
};

/**
 * Get posts bookmarked by the authenticated user.
 * @param {string} userId - Current user ID
 * @param {object} pagination
 * @param {number} [pagination.skip=0] - Records to skip
 * @param {number} [pagination.take=20] - Records to return
 * @returns {Promise<Post[]>} Bookmarked posts
 */
const getBookmarkedPosts = async (userId, { skip = 0, take = 20 } = {}) => {
  return postRepository.getBookmarkedPosts(userId, { skip, take });
};

export default { bookmarkPost, removeBookmark, getBookmarkedPosts };
