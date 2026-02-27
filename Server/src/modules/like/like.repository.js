import prisma from '../../config/prisma.js';

const createLike = (userId, postId) => {
  return prisma.like.create({
    data: { userId, postId },
  });
};

const deleteLike = (userId, postId) => {
  return prisma.like.delete({
    where: {
      userId_postId: { userId, postId },
    },
  });
};

const findLike = (userId, postId) => {
  return prisma.like.findUnique({
    where: {
      userId_postId: { userId, postId },
    },
  });
};

const countLikes = (postId) => {
  return prisma.like.count({
    where: { postId },
  });
};

export default { createLike, deleteLike, findLike, countLikes };
