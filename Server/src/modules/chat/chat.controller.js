import { ApiResponse, asyncHandler } from '../../core/index.js';
import chatService from './chat.service.js';

/**
 * Get all conversations for the authenticated user
 * @route GET /api/chat/conversations
 * @access Private
 * @returns {200} List of conversations ordered by most recent activity
 */
const getMyConversations = asyncHandler(async (req, res) => {
  const conversations = await chatService.getMyConversations(req.user.id);
  return res
    .status(200)
    .json(new ApiResponse(200, conversations, 'Conversations fetched successfully'));
});

/**
 * Get or create a direct 1-to-1 conversation with another user
 * @route POST /api/chat/conversations/:userId
 * @access Private
 * @param {string} req.params.userId - ID of the other user
 * @returns {200} Existing or newly created conversation
 */
const getOrCreateConversation = asyncHandler(async (req, res) => {
  const conversation = await chatService.getOrCreateConversation(req.user.id, req.params.userId);
  return res.status(200).json(new ApiResponse(200, conversation, 'Conversation ready'));
});

/**
 * Get paginated messages for a conversation
 * @route GET /api/chat/conversations/:conversationId/messages
 * @access Private
 * @param {string} req.params.conversationId - ID of the conversation
 * @query {number} [page=1] - Page number
 * @query {number} [limit=30] - Number of messages per page
 * @returns {200} List of messages (newest first) with sender details
 */
const getMessages = asyncHandler(async (req, res) => {
  const messages = await chatService.getMessages(
    req.params.conversationId,
    req.user.id,
    req.query,
    req.app.get('io')
  );
  return res.status(200).json(new ApiResponse(200, messages, 'Messages fetched successfully'));
});

/**
 * Send a message in a conversation (REST fallback - Socket.io is preferred for real-time)
 * @route POST /api/chat/conversations/:conversationId/messages
 * @access Private
 * @param {string} req.params.conversationId - ID of the conversation
 * @body {string} content - Message text (max 1000 characters)
 * @returns {201} Newly created message with sender details
 */
const sendMessage = asyncHandler(async (req, res) => {
  const message = await chatService.sendMessage(
    req.params.conversationId,
    req.user.id,
    req.body.content,
    req.app.get('io') // socket.io instance attached in index.js
  );
  return res.status(201).json(new ApiResponse(201, message, 'Message sent'));
});

/**
 * Get the total number of unread messages for the authenticated user
 * @route GET /api/chat/unread
 * @access Private
 * @returns {200} { unread: number } - Unread message count across all conversations
 */
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await chatService.getUnreadCount(req.user.id);
  return res.status(200).json(new ApiResponse(200, { unread: count }, 'Unread count fetched'));
});

export default {
  getMyConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  getUnreadCount,
};
