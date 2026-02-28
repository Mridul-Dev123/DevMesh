import ApiError from '../../core/ApiError.js';
import commentRepository from './comment.repository.js';

/**
 * Create a comment on a post
 * @param {string} userId - ID of the authenticated user
 * @param {string} postId - ID of the post being commented on
 * @param {string} content - Comment text
 * @throws {ApiError} 400 - If content is missing
 * @returns {Promise<{ comment: Comment, commentCount: number }>}
 */
const createComment = async (userId, postId, content) => {
  if (!content) {
    throw new ApiError(400, 'Comment content is required');
  }

  const comment = await commentRepository.createComment({
    content,
    authorId: userId,
    postId,
  });

  const commentCount = await commentRepository.countComments(postId);

  return { comment, commentCount };
};

/**
 * Retrieve paginated comments for a post along with the total count
 * @param {string} postId - ID of the post
 * @param {object} pagination - Pagination options
 * @param {number} [pagination.skip=0] - Records to skip
 * @param {number} [pagination.take=20] - Records to return
 * @returns {Promise<{ comments: Comment[], commentCount: number }>}
 */
const getCommentsByPost = async (postId, { skip = 0, take = 20 }) => {
  const [comments, commentCount] = await Promise.all([
    commentRepository.getCommentsByPost(postId, { skip, take }),
    commentRepository.countComments(postId),
  ]);

  return { comments, commentCount };
};

/**
 * Delete a comment, enforcing ownership
 * @param {string} userId - ID of the requesting user
 * @param {string} commentId - ID of the comment to delete
 * @throws {ApiError} 404 - If comment is not found
 * @throws {ApiError} 403 - If user is not the comment author
 * @returns {Promise<{ commentCount: number }>} Updated comment count for the post
 */
const deleteComment = async (userId, commentId) => {
  const comment = await commentRepository.findCommentById(commentId);

  if (!comment) {
    throw new ApiError(404, 'Comment not found');
  }

  if (comment.authorId !== userId) {
    throw new ApiError(403, 'You can only delete your own comments');
  }

  await commentRepository.deleteComment(commentId);
  const commentCount = await commentRepository.countComments(comment.postId);

  return { commentCount };
};

export default { createComment, getCommentsByPost, deleteComment };
