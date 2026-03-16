import prisma from '../../config/prisma.js';

/**
 * Transform a raw Prisma post (with a `likes` array) into a clean post
 * object with an `isLiked` boolean. The raw `likes` array is removed.
 * @param {object} post - Raw post from Prisma
 * @returns {object} Post with isLiked boolean
 */
const toPostWithIsLiked = (post) => {
  const { likes, ...rest } = post;
  return { ...rest, isLiked: Array.isArray(likes) && likes.length > 0 };
};

/**
 * Shared include fragment for fetching posts.
 * Accepts the current userId so the caller can determine isLiked.
 * @param {string} userId
 */
const postInclude = (userId) => ({
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
  likes: {
    where: { userId },
    select: { userId: true },
  },
});

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
 * @param {object} options
 * @param {number} [options.skip=0] - Records to skip
 * @param {number} [options.take=10] - Records to return
 * @param {string} options.userId - Current user ID (used to compute isLiked)
 * @returns {Promise<Post[]>} Posts with author info, like/comment counts, and isLiked
 */
const getAllPosts = async ({ skip = 0, take = 10, userId }) => {
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      include: postInclude(userId),
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.post.count(),
  ]);
  return { posts: posts.map(toPostWithIsLiked), total };
};
/**
 * Get paginated posts by a specific user, newest first
 * @param {string} authorId - Author's user ID
 * @param {object} pagination - Pagination options
 * @param {number} [pagination.skip=0] - Records to skip
 * @param {number} [pagination.take=20] - Records to return
 * @param {string} currentUserId - Current user ID (used to compute isLiked)
 * @returns {Promise<Post[]>} The user's posts
 */
const getPostsByUser = async (authorId, { skip = 0, take = 20 }, currentUserId) => {
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { authorId },
      include: postInclude(currentUserId),
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.post.count({ where: { authorId } }),
  ]);
  return { posts: posts.map(toPostWithIsLiked), total };
};

/**
 * Find a single post by ID
 * @param {string} id - Post ID
 * @param {string} [userId] - Current user ID (used to compute isLiked). Optional.
 */
const findPostById = async (id, userId = null) => {
  const post = await prisma.post.findUnique({
    where: { id },
    include: userId
      ? postInclude(userId)
      : {
          author: { select: { id: true, username: true, avatarUrl: true } },
          _count: { select: { likes: true, comments: true } },
        },
  });
  if (!post) return null;
  return userId ? toPostWithIsLiked(post) : post;
};

/**
 * Update a post
 */
const updatePost = (id, data) => {
  return prisma.post.update({
    where: { id },
    data,
  });
};

/**
 * Delete a post
 */
const deletePost = (id) => {
  return prisma.post.delete({
    where: { id },
  });
};

/**
 * Get paginated feed of posts from users the current user is following
 * @param {string} userId - Current user ID (also used to compute isLiked)
 * @param {object} pagination
 */
const getFollowingFeed = async (userId, { skip = 0, take = 10 }) => {
  const followingWhere = {
    author: {
      followers: {
        some: { followerId: userId, status: 'ACCEPTED' },
      },
    },
  };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: followingWhere,
      include: postInclude(userId),
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.post.count({ where: followingWhere }),
  ]);
  return { posts: posts.map(toPostWithIsLiked), total };
};

export default {
  createPost,
  getAllPosts,
  getPostsByUser,
  findPostById,
  updatePost,
  deletePost,
  getFollowingFeed,
};
