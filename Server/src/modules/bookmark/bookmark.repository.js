import prisma from '../../config/prisma.js';

/**
 * Create a bookmark record for a user-post pair.
 * @param {string} userId - ID of the user
 * @param {string} postId - ID of the post
 * @returns {Promise<Bookmark>} The created bookmark record
 */
const createBookmark = (userId, postId) => {
  return prisma.bookmark.create({
    data: { userId, postId },
  });
};

/**
 * Delete a bookmark record for a user-post pair.
 * @param {string} userId - ID of the user
 * @param {string} postId - ID of the post
 * @returns {Promise<Bookmark>} The deleted bookmark record
 */
const deleteBookmark = (userId, postId) => {
  return prisma.bookmark.delete({
    where: {
      userId_postId: { userId, postId },
    },
  });
};

/**
 * Find a bookmark record by user-post pair.
 * @param {string} userId - ID of the user
 * @param {string} postId - ID of the post
 * @returns {Promise<Bookmark|null>} The bookmark record or null
 */
const findBookmark = (userId, postId) => {
  return prisma.bookmark.findUnique({
    where: {
      userId_postId: { userId, postId },
    },
  });
};

export default { createBookmark, deleteBookmark, findBookmark };
