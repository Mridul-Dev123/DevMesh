import prisma from '../../config/prisma.js';

/**
 * Create a new post record
 * @param {object} data - Post data
 * @param {string} data.content - Post text
 * @param {string} data.authorId - Author's user ID
 * @returns {Promise<Post>} The created post
 */
const createPost = (data) => {
  return prisma.post.create({ data });
};
/**
 * Get paginated posts for the global feed, newest first
 * @param {object} pagination - Pagination options
 * @param {number} [pagination.skip=0] - Records to skip
 * @param {number} [pagination.take=10] - Records to return
 * @returns {Promise<Post[]>} Posts with author info and like/comment counts
 */
const getAllPosts = ({ skip = 0, take = 10 }) => {
  return prisma.post.findMany({
    include: {
      author: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    skip,
    take,
  });
};
/**
 * Get paginated posts by a specific user, newest first
 * @param {string} userId - Author's user ID
 * @param {object} pagination - Pagination options
 * @param {number} [pagination.skip=0] - Records to skip
 * @param {number} [pagination.take=20] - Records to return
 * @returns {Promise<Post[]>} The user's posts
 */
const getPostsByUser = async (userId, { skip = 0, take = 20 }) => {
  return prisma.post.findMany({
    where: {
      authorId: userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    skip,
    take,
  });
};
export default { createPost, getAllPosts, getPostsByUser };
