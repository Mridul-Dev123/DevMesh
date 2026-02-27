import prisma from '../../config/prisma.js';

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

const findCommentById = (id) => {
  return prisma.comment.findUnique({
    where: { id },
  });
};

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

const deleteComment = (id) => {
  return prisma.comment.delete({
    where: { id },
  });
};

const countComments = (postId) => {
  return prisma.comment.count({
    where: { postId },
  });
};

export default { createComment, findCommentById, getCommentsByPost, deleteComment, countComments };
