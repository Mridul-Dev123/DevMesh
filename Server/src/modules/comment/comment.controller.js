import { ApiResponse, asyncHandler } from '../../core/index.js';
import commentService from './comment.service.js';

const createComment = asyncHandler(async (req, res) => {
  const data = await commentService.createComment(req.user.id, req.params.postId, req.body.content);

  res.status(201).json(new ApiResponse(201, data, 'Comment added'));
});

const getCommentsByPost = asyncHandler(async (req, res) => {
  const { skip = 0, take = 20 } = req.query;
  const data = await commentService.getCommentsByPost(req.params.postId, {
    skip: Number(skip),
    take: Number(take),
  });

  res.status(200).json(new ApiResponse(200, data, 'Comments fetched'));
});

const deleteComment = asyncHandler(async (req, res) => {
  const data = await commentService.deleteComment(req.user.id, req.params.commentId);

  res.status(200).json(new ApiResponse(200, data, 'Comment deleted'));
});

export default { createComment, getCommentsByPost, deleteComment };
