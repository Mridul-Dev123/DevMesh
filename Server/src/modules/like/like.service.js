import ApiError from '../../core/ApiError.js';
import likeRepository from './like.repository.js';
import postRepository from '../post/post.repository.js';
import { buildPostInteractionNotification, emitNotificationToUser } from '../../utils/notifications.js';

/**
 * Like a post on behalf of the user
 * @param {string} userId - ID of the authenticated user
 * @param {string} postId - ID of the post to like
 * @throws {ApiError} 400 - If the post is already liked by this user
 * @returns {Promise<{ liked: true, likeCount: number }>}
 */
const likePost = async (userId, postId, io = null) => {
  const post = await postRepository.findPostById(postId);
  if (!post) {
    throw new ApiError(404, 'Post not found');
  }

  const existing = await likeRepository.findLike(userId, postId);

  if (existing) {
    throw new ApiError(400, 'Post already liked');
  }

  const like = await likeRepository.createLike(userId, postId);
  const likeCount = await likeRepository.countLikes(postId);

  if (post.author?.id && post.author.id !== userId) {
    const payload = buildPostInteractionNotification({
      type: 'post_liked',
      actor: like.user,
      post: {
        ...post,
        _count: {
          ...post._count,
          likes: likeCount,
        },
      },
    });
    emitNotificationToUser(io, post.author.id, payload);
  }

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
