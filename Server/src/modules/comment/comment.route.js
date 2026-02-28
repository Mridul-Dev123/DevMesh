import { Router } from 'express';
import commentController from './comment.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

/** @route POST   /api/comment/:postId      - Add a comment to a post */
router.post('/:postId', authenticate, commentController.createComment);
/** @route GET    /api/comment/:postId      - Get comments for a post  (query: skip, take) */
router.get('/:postId', authenticate, commentController.getCommentsByPost);
/** @route DELETE /api/comment/:commentId  - Delete own comment */
router.delete('/:commentId', authenticate, commentController.deleteComment);

export default router;
