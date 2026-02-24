import prisma from '../../config/prisma.js';

const findByEmail = (email) => {
  return prisma.user.findUnique({ where: { email } });
};

const findByUsername = (username) => {
  return prisma.user.findUnique({ where: { username } });
};
const getUser = (id) => {
  return prisma.user.findUnique({ where: { id } });
};

const createUser = (data) => {
  return prisma.user.create({ data });
};

export default {
  findByEmail,
  findByUsername,
  createUser,
  getUser,
};
