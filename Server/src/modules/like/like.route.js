import { Router } from 'express';
import likeController from './like.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validateUuidParam } from '../../middleware/validateRequest.js';

const router = Router();

/** @route POST   /api/like/:id  - Like a post */
router.post('/:id', authenticate, validateUuidParam('id'), likeController.likePost);
/** @route DELETE /api/like/:id  - Unlike a post */
router.delete('/:id', authenticate, validateUuidParam('id'), likeController.unlikePost);

export default router;
