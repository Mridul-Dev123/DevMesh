import prisma from '../../config/prisma.js';

const createPost = (data) => {
  return prisma.post.create({ data });
};
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
