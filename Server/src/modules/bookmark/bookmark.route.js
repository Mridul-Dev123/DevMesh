import { Router } from 'express';
import bookmarkController from './bookmark.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validateSkipTakeQuery, validateUuidParam } from '../../middleware/validateRequest.js';

const router = Router();

/** @route GET    /api/bookmark         - Get saved posts (query: skip, take) */
router.get('/', authenticate, validateSkipTakeQuery(), bookmarkController.getBookmarkedPosts);
/** @route POST   /api/bookmark/:postId - Save a post */
router.post('/:postId', authenticate, validateUuidParam('postId'), bookmarkController.bookmarkPost);
/** @route DELETE /api/bookmark/:postId - Remove a saved post */
router.delete(
  '/:postId',
  authenticate,
  validateUuidParam('postId'),
  bookmarkController.removeBookmark
);

export default router;
