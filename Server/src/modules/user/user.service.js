import { ApiError } from '../../core/index.js';
import userRepository from './user.repository.js';
import bcrypt from 'bcrypt';

/**
 * Register a new user after validating uniqueness and hashing the password
 * @param {object} data - Registration payload
 * @param {string} data.username - Desired username
 * @param {string} data.email - User email address
 * @param {string} data.password - Plain-text password
 * @throws {ApiError} 400 - If any required field is missing, username is taken, or email already exists
 * @returns {Promise<Omit<User, 'password'>>} Created user without the password field
 */
const register = async (data) => {
  const { username, email, password } = data;
  if (!username || !email || !password) {
    throw new ApiError(400, 'Username, password, email are required');
  }
  let existingUser = await userRepository.findByUsername(username);
  if (existingUser) throw new ApiError(400, 'Username taken');

  existingUser = await userRepository.findByEmail(email);
  if (existingUser) throw new ApiError(400, 'Email already exist');

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await userRepository.createUser({
    username,
    email,
    password: hashedPassword,
  });

  const { password: _, ...safeUser } = user;

  return safeUser;
};

/**
 * Get a user profile with aggregated stats
 * @param {string} userId - Target user ID
 */
const getProfile = async (userId) => {
  const profile = await userRepository.getProfileById(userId);

  if (!profile) {
    throw new ApiError(404, 'User not found');
  }

  const stats = await userRepository.getProfileStats(userId);
  return { ...profile, stats };
};

/**
 * Update authenticated user's profile fields
 * @param {string} userId - Authenticated user id
 * @param {{ bio?: string, techStack?: string[]|string, avatarUrl?: string|null }} data
 */
const updateProfile = async (userId, data) => {
  const updateData = {};

  if (typeof data.bio === 'string') {
    updateData.bio = data.bio.trim();
  }

  if (Array.isArray(data.techStack)) {
    updateData.techStack = data.techStack
      .map((item) => String(item).trim())
      .filter(Boolean);
  } else if (typeof data.techStack === 'string') {
    updateData.techStack = data.techStack
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof data.avatarUrl === 'string' || data.avatarUrl === null) {
    updateData.avatarUrl = data.avatarUrl;
  }

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, 'No valid profile fields provided');
  }

  return userRepository.updateProfile(userId, updateData);
};

export default { register, getProfile, updateProfile };
