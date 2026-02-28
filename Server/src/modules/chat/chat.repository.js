import prisma from '../../config/prisma.js';

/**
 * Find an existing conversation between two users regardless of participant order
 * @param {string} userAId - ID of the first user
 * @param {string} userBId - ID of the second user
 * @returns {Promise<Conversation|null>} The conversation with participant details, or null
 */
const findConversation = (userAId, userBId) => {
  return prisma.conversation.findFirst({
    where: {
      OR: [
        { participantA: userAId, participantB: userBId },
        { participantA: userBId, participantB: userAId },
      ],
    },
    include: {
      userA: { select: { id: true, username: true, avatarUrl: true } },
      userB: { select: { id: true, username: true, avatarUrl: true } },
    },
  });
};

/**
 * Create a new direct conversation between two users
 * @param {string} userAId - ID of participant A
 * @param {string} userBId - ID of participant B
 * @returns {Promise<Conversation>} The newly created conversation with participant details
 */
const createConversation = (userAId, userBId) => {
  return prisma.conversation.create({
    data: {
      participantA: userAId,
      participantB: userBId,
    },
    include: {
      userA: { select: { id: true, username: true, avatarUrl: true } },
      userB: { select: { id: true, username: true, avatarUrl: true } },
    },
  });
};

/**
 * Get all conversations for a user ordered by most recent activity, each with the latest message
 * @param {string} userId - ID of the user
 * @returns {Promise<Conversation[]>} Conversations with participants and last message
 */
const getUserConversations = (userId) => {
  return prisma.conversation.findMany({
    where: {
      OR: [{ participantA: userId }, { participantB: userId }],
    },
    include: {
      userA: { select: { id: true, username: true, avatarUrl: true } },
      userB: { select: { id: true, username: true, avatarUrl: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { updatedAt: 'desc' },
  });
};

/**
 * Find a conversation by its ID including participant details
 * @param {string} id - Conversation ID
 * @returns {Promise<Conversation|null>} The conversation or null if not found
 */
const findConversationById = (id) => {
  return prisma.conversation.findUnique({
    where: { id },
    include: {
      userA: { select: { id: true, username: true, avatarUrl: true } },
      userB: { select: { id: true, username: true, avatarUrl: true } },
    },
  });
};

/**
 * Get paginated messages for a conversation in descending chronological order
 * @param {string} conversationId - ID of the conversation
 * @param {object} pagination - Pagination options
 * @param {number} [pagination.skip=0] - Number of records to skip
 * @param {number} [pagination.take=30] - Number of records to return
 * @returns {Promise<Message[]>} Messages with sender details
 */
const getMessages = (conversationId, { skip = 0, take = 30 }) => {
  return prisma.message.findMany({
    where: { conversationId },
    include: {
      sender: { select: { id: true, username: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take,
  });
};

/**
 * Create a message and atomically update the conversation's updatedAt timestamp
 * @param {string} conversationId - ID of the target conversation
 * @param {string} senderId - ID of the sending user
 * @param {string} content - Text content of the message
 * @returns {Promise<Message>} The created message with sender details
 */
const createMessage = async (conversationId, senderId, content) => {
  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: { conversationId, senderId, content },
      include: {
        sender: { select: { id: true, username: true, avatarUrl: true } },
      },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
  ]);
  return message;
};

/**
 * Mark all unread messages from the other participant as read
 * @param {string} conversationId - ID of the conversation
 * @param {string} recipientId - ID of the user reading the messages (their sent messages are excluded)
 * @returns {Promise<{ count: number }>} Prisma batch update result
 */
const markMessagesRead = (conversationId, recipientId) => {
  return prisma.message.updateMany({
    where: {
      conversationId,
      isRead: false,
      senderId: { not: recipientId },
    },
    data: { isRead: true },
  });
};

/**
 * Count all unread messages directed to a user across every conversation they participate in
 * @param {string} userId - ID of the recipient user
 * @returns {Promise<number>} Total count of unread messages
 */
const countUnread = (userId) => {
  return prisma.message.count({
    where: {
      isRead: false,
      senderId: { not: userId },
      conversation: {
        OR: [{ participantA: userId }, { participantB: userId }],
      },
    },
  });
};

export default {
  findConversation,
  createConversation,
  getUserConversations,
  findConversationById,
  getMessages,
  createMessage,
  markMessagesRead,
  countUnread,
};
