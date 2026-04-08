import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import chatController from './chat.controller.js';
import {
  validatePageLimitQuery,
  validateSendMessageBody,
  validateUuidParam,
} from '../../middleware/validateRequest.js';

const router = Router();

// All chat routes require authentication
router.use(authenticate);

/** @route GET  /api/chat/conversations                              - List all conversations for the authenticated user */
router.get('/conversations', chatController.getMyConversations);
/** @route POST /api/chat/conversations/:userId                      - Get or create a DM with another user */
router.post(
  '/conversations/:userId',
  validateUuidParam('userId'),
  chatController.getOrCreateConversation
);

/** @route GET  /api/chat/conversations/:conversationId/messages     - Get messages in a conversation (query: page, limit) */
router.get(
  '/conversations/:conversationId/messages',
  validateUuidParam('conversationId'),
  validatePageLimitQuery({ maxLimit: 100 }),
  chatController.getMessages
);
/** @route POST /api/chat/conversations/:conversationId/messages     - Send a message (REST fallback) */
router.post(
  '/conversations/:conversationId/messages',
  validateUuidParam('conversationId'),
  validateSendMessageBody,
  chatController.sendMessage
);

/** @route GET  /api/chat/unread                                     - Get unread message count */
router.get('/unread', chatController.getUnreadCount);

export default router;
