import prisma from '../../config/prisma.js';

const createFollow = (followerId, followingId) => {
  return prisma.follow.create({
    data: { followerId, followingId },
  });
};

const findFollow = (followerId, followingId) => {
  return prisma.follow.findUnique({
    where: {
      followerId_followingId: { followerId, followingId },
    },
  });
};

const updateFollowStatus = (followerId, followingId, status) => {
  return prisma.follow.update({
    where: {
      followerId_followingId: { followerId, followingId },
    },
    data: { status },
  });
};

const deleteFollow = (followerId, followingId) => {
  return prisma.follow.delete({
    where: {
      followerId_followingId: { followerId, followingId },
    },
  });
};

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

const countFollowers = (userId) => {
  return prisma.follow.count({
    where: { followingId: userId, status: 'ACCEPTED' },
  });
};

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
