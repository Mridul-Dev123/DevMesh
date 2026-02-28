import { Router } from 'express';
import likeController from './like.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

/** @route POST   /api/like/:id  - Like a post */
router.post('/:id', authenticate, likeController.likePost);
/** @route DELETE /api/like/:id  - Unlike a post */
router.delete('/:id', authenticate, likeController.unlikePost);

export default router;
