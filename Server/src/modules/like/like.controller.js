import { ApiResponse, asyncHandler } from '../../core/index.js';
import likeService from './like.service.js';

/**
 * Like a post
 * @route POST /api/like/:id
 * @access Private
 * @param {string} req.params.id - ID of the post to like
 * @returns {200} { liked: true, likeCount: number }
 */
const likePost = asyncHandler(async (req, res) => {
  const data = await likeService.likePost(req.user.id, req.params.id);

  res.status(200).json(new ApiResponse(200, data, 'Post liked'));
});

/**
 * Unlike a previously liked post
 * @route DELETE /api/like/:id
 * @access Private
 * @param {string} req.params.id - ID of the post to unlike
 * @returns {200} { liked: false, likeCount: number }
 */
const unlikePost = asyncHandler(async (req, res) => {
  const data = await likeService.unlikePost(req.user.id, req.params.id);

  res.status(200).json(new ApiResponse(200, data, 'Post unliked'));
});

export default { likePost, unlikePost };
