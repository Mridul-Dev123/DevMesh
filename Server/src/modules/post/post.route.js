import { Router } from 'express';
import postController from './post.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { uploadMedia } from '../../middleware/upload.js';
import {
  validateCreatePostBody,
  validatePageLimitQuery,
  validateSkipTakeQuery,
  validateUpdatePostBody,
  validateUuidParam,
} from '../../middleware/validateRequest.js';

const router = Router();

/** @route POST   /api/post          - Create a new post */
router.post(
  '/',
  authenticate,
  uploadMedia.single('media'),
  validateCreatePostBody,
  postController.createPost
);
/** @route GET    /api/post          - Get global feed (query: page, limit) */
router.get('/', authenticate, validatePageLimitQuery(), postController.getFeed);
/** @route GET    /api/post/feed/following - Get following-only feed (query: page, limit) */
router.get(
  '/feed/following',
  authenticate,
  validatePageLimitQuery(),
  postController.getFollowingFeed
);
/** @route GET    /api/post/user/:userId - Get posts by a specific user (query: skip, take) */
router.get(
  '/user/:userId',
  authenticate,
  validateUuidParam('userId'),
  validateSkipTakeQuery(),
  postController.getUserPosts
);
/** @route GET    /api/post/:id      - Get a single post by ID */
router.get('/:id', authenticate, validateUuidParam('id'), postController.getPost);
/** @route PATCH  /api/post/:id      - Update a post (author only) */
router.patch(
  '/:id',
  authenticate,
  validateUuidParam('id'),
  validateUpdatePostBody,
  postController.updatePost
);
/** @route DELETE /api/post/:id      - Delete a post (author only) */
router.delete('/:id', authenticate, validateUuidParam('id'), postController.deletePost);

export default router;
