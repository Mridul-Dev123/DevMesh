import prisma from '../../config/prisma.js';

/**
 * Find a user by email address
 * @param {string} email - Email to search
 * @returns {Promise<User|null>} The user or null
 */
const findByEmail = (email) => {
  return prisma.user.findUnique({ where: { email } });
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
 * Find a user by their primary ID
 * @param {string} id - User UUID
 * @returns {Promise<User|null>} The user or null
 */
const getUser = (id) => {
  return prisma.user.findUnique({ where: { id } });
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
  createUser,
  getUser,
};
