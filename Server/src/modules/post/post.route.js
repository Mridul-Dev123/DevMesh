import { Router } from 'express';
import postController from './post.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

router.post('/', authenticate, postController.createPost);
router.get('/', authenticate, postController.getFeed);
router.get('/:id', authenticate, postController.getPost);
router.get('/user/:userId', authenticate, postController.getUserPosts);
router.patch('/:id', authenticate, postController.updatePost);
router.delete('/:id', authenticate, postController.deletePost);

export default router;
