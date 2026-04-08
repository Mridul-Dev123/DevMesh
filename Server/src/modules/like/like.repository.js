import prisma from '../../config/prisma.js';

/**
 * Create a like record for a user-post pair
 * @param {string} userId - ID of the user
 * @param {string} postId - ID of the post
 * @returns {Promise<Like>} The created like record
 */
const createLike = (userId, postId) => {
  return prisma.like.create({
    data: { userId, postId },
    include: {
      user: {
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
 * Delete a like record for a user-post pair
 * @param {string} userId - ID of the user
 * @param {string} postId - ID of the post
 * @returns {Promise<Like>} The deleted like record
 */
const deleteLike = (userId, postId) => {
  return prisma.like.delete({
    where: {
      userId_postId: { userId, postId },
    },
  });
};

/**
 * Find a like record by user-post pair
 * @param {string} userId - ID of the user
 * @param {string} postId - ID of the post
 * @returns {Promise<Like|null>} The like record or null
 */
const findLike = (userId, postId) => {
  return prisma.like.findUnique({
    where: {
      userId_postId: { userId, postId },
    },
  });
};

/**
 * Count the total number of likes on a post
 * @param {string} postId - ID of the post
 * @returns {Promise<number>} Total like count
 */
const countLikes = (postId) => {
  return prisma.like.count({
    where: { postId },
  });
};

export default { createLike, deleteLike, findLike, countLikes };
