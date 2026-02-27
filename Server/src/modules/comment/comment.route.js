import { Router } from 'express';
import commentController from './comment.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

router.post('/:postId', authenticate, commentController.createComment);
router.get('/:postId', authenticate, commentController.getCommentsByPost);
router.delete('/:commentId', authenticate, commentController.deleteComment);

export default router;
