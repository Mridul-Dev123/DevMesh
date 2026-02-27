import { Router } from 'express';
import likeController from './like.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

router.post('/:id', authenticate, likeController.likePost);
router.delete('/:id', authenticate, likeController.unlikePost);

export default router;
