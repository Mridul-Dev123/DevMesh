import ApiError from '../../core/ApiError.js';
import chatRepository from './chat.repository.js';

/**
 * Get an existing conversation or create a new one between two users
 * @param {string} currentUserId - ID of the requesting user
 * @param {string} otherUserId - ID of the other participant
 * @throws {ApiError} 400 - If user tries to message themselves
 * @returns {Promise<Conversation>} The existing or newly created conversation
 */
const getOrCreateConversation = async (currentUserId, otherUserId) => {
  if (currentUserId === otherUserId) {
    throw new ApiError(400, 'You cannot start a conversation with yourself');
  }

  let conversation = await chatRepository.findConversation(currentUserId, otherUserId);
  if (!conversation) {
    conversation = await chatRepository.createConversation(currentUserId, otherUserId);
  }
  return conversation;
};

/**
 * List all conversations for the given user, ordered by most recent activity
 * @param {string} userId - ID of the authenticated user
 * @returns {Promise<Conversation[]>} Conversations with participants and latest message
 */
const getMyConversations = (userId) => {
  return chatRepository.getUserConversations(userId);
};

/**
 * Get paginated messages for a conversation, marking unread messages as read
 * @param {string} conversationId - ID of the conversation
 * @param {string} userId - ID of the requesting user (must be a participant)
 * @param {object} [options={}] - Pagination options
 * @param {number} [options.page=1] - Page number
 * @param {number} [options.limit=30] - Messages per page
 * @throws {ApiError} 404 - If conversation does not exist
 * @throws {ApiError} 403 - If user is not a participant
 * @returns {Promise<Message[]>} Paginated messages with sender info
 */
const getMessages = async (conversationId, userId, { page = 1, limit = 30 } = {}) => {
  const conversation = await chatRepository.findConversationById(conversationId);
  if (!conversation) throw new ApiError(404, 'Conversation not found');

  const isParticipant =
    conversation.participantA === userId || conversation.participantB === userId;
  if (!isParticipant) throw new ApiError(403, 'You are not a participant in this conversation');

  const skip = (page - 1) * Number(limit);
  const take = Number(limit);

  // Mark messages from the other side as read
  await chatRepository.markMessagesRead(conversationId, userId);

  return chatRepository.getMessages(conversationId, { skip, take });
};

/**
 * Create and persist a message, then emit it to the Socket.io room
 * @param {string} conversationId - ID of the target conversation
 * @param {string} senderId - ID of the sending user
 * @param {string} content - Message text
 * @param {import('socket.io').Server|null} [io=null] - Socket.io server instance for real-time emit
 * @throws {ApiError} 400 - If content is empty
 * @throws {ApiError} 404 - If conversation does not exist
 * @throws {ApiError} 403 - If sender is not a participant
 * @returns {Promise<Message>} The created message with sender details
 */
const sendMessage = async (conversationId, senderId, content, io = null) => {
  if (!content || !content.trim()) throw new ApiError(400, 'Message content cannot be empty');

  const conversation = await chatRepository.findConversationById(conversationId);
  if (!conversation) throw new ApiError(404, 'Conversation not found');

  const isParticipant =
    conversation.participantA === senderId || conversation.participantB === senderId;
  if (!isParticipant) throw new ApiError(403, 'You are not a participant in this conversation');

  const message = await chatRepository.createMessage(conversationId, senderId, content.trim());

  // Emit real-time event if socket.io is available
  if (io) {
    io.to(conversationId).emit('new_message', message);
  }

  return message;
};

/**
 * Count all unread messages sent to the given user across all conversations
 * @param {string} userId - ID of the authenticated user
 * @returns {Promise<number>} Total number of unread messages
 */
const getUnreadCount = (userId) => {
  return chatRepository.countUnread(userId);
};

export default {
  getOrCreateConversation,
  getMyConversations,
  getMessages,
  sendMessage,
  getUnreadCount,
};
