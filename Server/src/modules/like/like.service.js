import ApiError from '../../core/ApiError.js';
import likeRepository from './like.repository.js';

const likePost = async (userId, postId) => {
  const existing = await likeRepository.findLike(userId, postId);

  if (existing) {
    throw new ApiError(400, 'Post already liked');
  }

  await likeRepository.createLike(userId, postId);
  const likeCount = await likeRepository.countLikes(postId);

  return { liked: true, likeCount };
};

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
