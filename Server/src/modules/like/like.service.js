import ApiError from '../../core/ApiError.js';
import likeRepository from './like.repository.js';

/**
 * Like a post on behalf of the user
 * @param {string} userId - ID of the authenticated user
 * @param {string} postId - ID of the post to like
 * @throws {ApiError} 400 - If the post is already liked by this user
 * @returns {Promise<{ liked: true, likeCount: number }>}
 */
const likePost = async (userId, postId) => {
  const existing = await likeRepository.findLike(userId, postId);

  if (existing) {
    throw new ApiError(400, 'Post already liked');
  }

  await likeRepository.createLike(userId, postId);
  const likeCount = await likeRepository.countLikes(postId);

  return { liked: true, likeCount };
};

/**
 * Remove a like from a post
 * @param {string} userId - ID of the authenticated user
 * @param {string} postId - ID of the post to unlike
 * @throws {ApiError} 404 - If no like exists for this user-post pair
 * @returns {Promise<{ liked: false, likeCount: number }>}
 */
const unlikePost = async (userId, postId) => {
  const existing = await likeRepository.findLike(userId, postId);

  if (!existing) {
    throw new ApiError(404, 'Like not found');
  }

  await likeRepository.deleteLike(userId, postId);
  const likeCount = await likeRepository.countLikes(postId);

  return { liked: false, likeCount };
};

export default { likePost, unlikePost };
