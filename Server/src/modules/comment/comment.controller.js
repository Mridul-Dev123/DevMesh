import { ApiResponse, asyncHandler } from '../../core/index.js';
import commentService from './comment.service.js';

/**
 * Add a comment to a post
 * @route POST /api/comment/:postId
 * @access Private
 * @param {string} req.params.postId - ID of the post to comment on
 * @body {string} content - Comment text (max 280 characters)
 * @returns {201} Created comment object and updated total comment count
 */
const createComment = asyncHandler(async (req, res) => {
  const data = await commentService.createComment(req.user.id, req.params.postId, req.body.content);

  res.status(201).json(new ApiResponse(201, data, 'Comment added'));
});

/**
 * Get all comments for a post with pagination
 * @route GET /api/comment/:postId
 * @access Private
 * @param {string} req.params.postId - ID of the post
 * @query {number} [skip=0] - Number of comments to skip
 * @query {number} [take=20] - Number of comments to return
 * @returns {200} Paginated list of comments and total comment count
 */
const getCommentsByPost = asyncHandler(async (req, res) => {
  const { skip = 0, take = 20 } = req.query;
  const data = await commentService.getCommentsByPost(req.params.postId, {
    skip: Number(skip),
    take: Number(take),
  });

  res.status(200).json(new ApiResponse(200, data, 'Comments fetched'));
});

/**
 * Delete a comment (only the comment author can delete)
 * @route DELETE /api/comment/:commentId
 * @access Private
 * @param {string} req.params.commentId - ID of the comment to delete
 * @returns {200} Updated total comment count for the post
 */
const deleteComment = asyncHandler(async (req, res) => {
  const data = await commentService.deleteComment(req.user.id, req.params.commentId);

  res.status(200).json(new ApiResponse(200, data, 'Comment deleted'));
});

export default { createComment, getCommentsByPost, deleteComment };
