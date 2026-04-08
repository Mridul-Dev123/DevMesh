import prisma from '../../config/prisma.js';

/**
 * Transform a raw Prisma post into a clean post object with derived
 * per-user booleans for likes and bookmarks.
 * @param {object} post - Raw post from Prisma
 * @returns {object} Post with user-specific flags
 */
const toPostWithUserState = (post) => {
  const { likes, bookmarks, ...rest } = post;
  return {
    ...rest,
    isLiked: Array.isArray(likes) && likes.length > 0,
    isBookmarked: Array.isArray(bookmarks) && bookmarks.length > 0,
  };
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
  bookmarks: {
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
  const posts = await prisma.post.findMany({
    include: postInclude(userId),
    orderBy: { createdAt: 'desc' },
    skip,
    take,
  });
  return posts.map(toPostWithUserState);
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
  const posts = await prisma.post.findMany({
    where: { authorId },
    include: postInclude(currentUserId),
    orderBy: { createdAt: 'desc' },
    skip,
    take,
  });
  return posts.map(toPostWithUserState);
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
  return userId ? toPostWithUserState(post) : post;
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
  const posts = await prisma.post.findMany({
    where: {
      author: {
        followers: {
          some: {
            followerId: userId,
            status: 'ACCEPTED',
          },
        },
      },
    },
    include: postInclude(userId),
    orderBy: { createdAt: 'desc' },
    skip,
    take,
  });
  return posts.map(toPostWithUserState);
};

/**
 * Get posts bookmarked by the current user, most recently saved first.
 * @param {string} userId - Current user ID
 * @param {object} pagination
 * @param {number} [pagination.skip=0] - Records to skip
 * @param {number} [pagination.take=20] - Records to return
 * @returns {Promise<Post[]>} Bookmarked posts with user-specific flags
 */
const getBookmarkedPosts = async (userId, { skip = 0, take = 20 } = {}) => {
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    skip,
    take,
    include: {
      post: {
        include: postInclude(userId),
      },
    },
  });

  return bookmarks.map(({ post }) => toPostWithUserState(post));
};

export default {
  createPost,
  getAllPosts,
  getBookmarkedPosts,
  getPostsByUser,
  findPostById,
  updatePost,
  deletePost,
  getFollowingFeed,
};

export { postInclude, toPostWithUserState };
