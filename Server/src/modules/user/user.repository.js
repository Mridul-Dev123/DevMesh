import prisma from '../../config/prisma.js';

const safeUserSelect = {
  id: true,
  username: true,
  email: true,
  avatarUrl: true,
  bio: true,
  techStack: true,
  createdAt: true,
};

/**
 * Find a user by email address
 * @param {string} email - Email to search
 * @returns {Promise<User|null>} The user or null
 */
const findByEmail = (email) => {
  return prisma.user.findFirst({ where: { email } });
};

/**
 * Find a user by username
 * @param {string} username - Username to search
 * @returns {Promise<User|null>} The user or null
 */
const findByUsername = (username) => {
  return prisma.user.findUnique({ where: { username } });
};

/**
 * Find a user by either username or email
 * @param {string} identifier - Username or email
 * @returns {Promise<User|null>} The user or null
 */
const findByUsernameOrEmail = (identifier) => {
  return prisma.user.findFirst({
    where: {
      OR: [{ username: identifier }, { email: identifier }],
    },
  });
};
/**
 * Find a user by their primary ID
 * @param {string} id - User UUID
 * @returns {Promise<User|null>} The user or null
 */
const getUser = (id) => {
  return prisma.user.findUnique({ where: { id } });
};

/**
 * Get a user profile by id (without password)
 * @param {string} id - User UUID
 * @returns {Promise<object|null>} Sanitized user profile
 */
const getProfileById = (id) => {
  return prisma.user.findUnique({
    where: { id },
    select: safeUserSelect,
  });
};

/**
 * Update profile fields for a user and return sanitized user data
 * @param {string} id - User UUID
 * @param {{ bio?: string, techStack?: string[], avatarUrl?: string|null }} data
 */
const updateProfile = (id, data) => {
  return prisma.user.update({
    where: { id },
    data,
    select: safeUserSelect,
  });
};

/**
 * Aggregate profile stats for a user
 * @param {string} id - User UUID
 */
const getProfileStats = async (id) => {
  const [posts, followers, following] = await Promise.all([
    prisma.post.count({ where: { authorId: id } }),
    prisma.follow.count({ where: { followingId: id, status: 'ACCEPTED' } }),
    prisma.follow.count({ where: { followerId: id, status: 'ACCEPTED' } }),
  ]);

  return { posts, followers, following };
};

/**
 * Create a new user record
 * @param {object} data - User data
 * @param {string} data.username - Username
 * @param {string} data.email - Email
 * @param {string} data.password - Hashed password
 * @returns {Promise<User>} The created user
 */
const createUser = (data) => {
  return prisma.user.create({ data });
};

export default {
  findByEmail,
  findByUsername,
  findByUsernameOrEmail,
  createUser,
  getUser,
  getProfileById,
  updateProfile,
  getProfileStats,
};
