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

export default { register };
