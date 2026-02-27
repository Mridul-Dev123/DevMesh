import { ApiError } from '../../core/index.js';
import userRepository from './user.repository.js';
import bcrypt from 'bcrypt';

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
