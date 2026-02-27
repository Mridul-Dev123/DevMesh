import { ApiResponse, asyncHandler } from '../../core/index.js';
import likeService from './like.service.js';

const likePost = asyncHandler(async (req, res) => {
  const data = await likeService.likePost(req.user.id, req.params.id);

  res.status(200).json(new ApiResponse(200, data, 'Post liked'));
});

const unlikePost = asyncHandler(async (req, res) => {
  const data = await likeService.unlikePost(req.user.id, req.params.id);

  res.status(200).json(new ApiResponse(200, data, 'Post unliked'));
});

export default { likePost, unlikePost };
