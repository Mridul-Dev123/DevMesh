import prisma from '../../config/prisma.js';

/**
 * Create a new comment and return it with author details
 * @param {object} data - Comment data
 * @param {string} data.content - Comment text
 * @param {string} data.authorId - ID of the author
 * @param {string} data.postId - ID of the post
 * @returns {Promise<Comment>} Created comment with author info
 */
const createComment = (data) => {
  return prisma.comment.create({
    data,
    include: {
      author: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
        },
      },
    },
  });
};

/**
 * Find a comment by its ID
 * @param {string} id - Comment ID
 * @returns {Promise<Comment|null>} The comment or null
 */
const findCommentById = (id) => {
  return prisma.comment.findUnique({
    where: { id },
  });
};

/**
 * Get paginated comments for a post in descending order
 * @param {string} postId - ID of the post
 * @param {object} pagination - Pagination options
 * @param {number} [pagination.skip=0] - Records to skip
 * @param {number} [pagination.take=20] - Records to return
 * @returns {Promise<Comment[]>} Comments with author details
 */
const getCommentsByPost = (postId, { skip = 0, take = 20 }) => {
  return prisma.comment.findMany({
    where: { postId },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take,
  });
};

/**
 * Delete a comment by its ID
 * @param {string} id - Comment ID
 * @returns {Promise<Comment>} The deleted comment
 */
const deleteComment = (id) => {
  return prisma.comment.delete({
    where: { id },
  });
};

/**
 * Count the total number of comments on a post
 * @param {string} postId - ID of the post
 * @returns {Promise<number>} Total comment count
 */
const countComments = (postId) => {
  return prisma.comment.count({
    where: { postId },
  });
};

export default { createComment, findCommentById, getCommentsByPost, deleteComment, countComments };
