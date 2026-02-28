import prisma from '../../config/prisma.js';

/**
 * Create a new follow record with PENDING status
 * @param {string} followerId - ID of the follower
 * @param {string} followingId - ID of the user being followed
 * @returns {Promise<Follow>} The created follow record
 */
const createFollow = (followerId, followingId) => {
  return prisma.follow.create({
    data: { followerId, followingId },
  });
};

/**
 * Find a follow record by the unique follower-following pair
 * @param {string} followerId - ID of the follower
 * @param {string} followingId - ID of the user being followed
 * @returns {Promise<Follow|null>} The follow record or null
 */
const findFollow = (followerId, followingId) => {
  return prisma.follow.findUnique({
    where: {
      followerId_followingId: { followerId, followingId },
    },
  });
};

/**
 * Update the status of a follow record (e.g. PENDING -> ACCEPTED)
 * @param {string} followerId - ID of the follower
 * @param {string} followingId - ID of the user being followed
 * @param {string} status - New status value ('PENDING' | 'ACCEPTED')
 * @returns {Promise<Follow>} Updated follow record
 */
const updateFollowStatus = (followerId, followingId, status) => {
  return prisma.follow.update({
    where: {
      followerId_followingId: { followerId, followingId },
    },
    data: { status },
  });
};

/**
 * Delete a follow record
 * @param {string} followerId - ID of the follower
 * @param {string} followingId - ID of the user being followed
 * @returns {Promise<Follow>} The deleted follow record
 */
const deleteFollow = (followerId, followingId) => {
  return prisma.follow.delete({
    where: {
      followerId_followingId: { followerId, followingId },
    },
  });
};

/**
 * Get paginated accepted followers of a user
 * @param {string} userId - ID of the user
 * @param {object} pagination - Pagination options
 * @param {number} [pagination.skip=0] - Records to skip
 * @param {number} [pagination.take=20] - Records to return
 * @returns {Promise<Follow[]>} Follow records with follower user details
 */
const getFollowers = (userId, { skip = 0, take = 20 }) => {
  return prisma.follow.findMany({
    where: { followingId: userId, status: 'ACCEPTED' },
    include: {
      follower: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          bio: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take,
  });
};

/**
 * Get paginated accepted following relationships of a user
 * @param {string} userId - ID of the user
 * @param {object} pagination - Pagination options
 * @param {number} [pagination.skip=0] - Records to skip
 * @param {number} [pagination.take=20] - Records to return
 * @returns {Promise<Follow[]>} Follow records with following user details
 */
const getFollowing = (userId, { skip = 0, take = 20 }) => {
  return prisma.follow.findMany({
    where: { followerId: userId, status: 'ACCEPTED' },
    include: {
      following: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          bio: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take,
  });
};

/**
 * Get paginated pending follow requests received by a user
 * @param {string} userId - ID of the user receiving requests
 * @param {object} pagination - Pagination options
 * @param {number} [pagination.skip=0] - Records to skip
 * @param {number} [pagination.take=20] - Records to return
 * @returns {Promise<Follow[]>} Pending follow records with requester details
 */
const getPendingRequests = (userId, { skip = 0, take = 20 }) => {
  return prisma.follow.findMany({
    where: { followingId: userId, status: 'PENDING' },
    include: {
      follower: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          bio: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take,
  });
};

/**
 * Count the total number of accepted followers for a user
 * @param {string} userId - ID of the user
 * @returns {Promise<number>} Total follower count
 */
const countFollowers = (userId) => {
  return prisma.follow.count({
    where: { followingId: userId, status: 'ACCEPTED' },
  });
};

/**
 * Count the total number of users a given user is following (accepted)
 * @param {string} userId - ID of the user
 * @returns {Promise<number>} Total following count
 */
const countFollowing = (userId) => {
  return prisma.follow.count({
    where: { followerId: userId, status: 'ACCEPTED' },
  });
};

export default {
  createFollow,
  findFollow,
  updateFollowStatus,
  deleteFollow,
  getFollowers,
  getFollowing,
  getPendingRequests,
  countFollowers,
  countFollowing,
};
