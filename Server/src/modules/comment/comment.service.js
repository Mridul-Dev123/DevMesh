import ApiError from '../../core/ApiError.js';
import commentRepository from './comment.repository.js';

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

const getCommentsByPost = async (postId, { skip = 0, take = 20 }) => {
  const [comments, commentCount] = await Promise.all([
    commentRepository.getCommentsByPost(postId, { skip, take }),
    commentRepository.countComments(postId),
  ]);

  return { comments, commentCount };
};

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
