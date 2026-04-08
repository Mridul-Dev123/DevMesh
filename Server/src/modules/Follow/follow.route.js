import { Router } from 'express';
import followController from './follow.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validateSkipTakeQuery, validateUuidParam } from '../../middleware/validateRequest.js';

const router = Router();

/** @route GET    /api/follow/pending               - Get pending follow requests for the authenticated user */
router.get('/pending', authenticate, validateSkipTakeQuery(), followController.getPendingRequests);

/** @route POST   /api/follow/:userId               - Send a follow request */
router.post(
  '/:userId',
  authenticate,
  validateUuidParam('userId'),
  followController.sendFollowRequest
);
/** @route PATCH  /api/follow/:userId/accept        - Accept a follow request */
router.patch(
  '/:userId/accept',
  authenticate,
  validateUuidParam('userId'),
  followController.acceptFollowRequest
);
/** @route DELETE /api/follow/:userId/reject        - Reject a follow request */
router.delete(
  '/:userId/reject',
  authenticate,
  validateUuidParam('userId'),
  followController.rejectFollowRequest
);
/** @route DELETE /api/follow/:userId               - Unfollow a user */
router.delete('/:userId', authenticate, validateUuidParam('userId'), followController.unfollow);
/** @route GET    /api/follow/:userId/status        - Get follow status between auth user and target user */
router.get(
  '/:userId/status',
  authenticate,
  validateUuidParam('userId'),
  followController.getFollowStatus
);
/** @route GET    /api/follow/:userId/followers     - Get a user's followers (query: skip, take) */
router.get(
  '/:userId/followers',
  authenticate,
  validateUuidParam('userId'),
  validateSkipTakeQuery(),
  followController.getFollowers
);
/** @route GET    /api/follow/:userId/following     - Get users a user follows (query: skip, take) */
router.get(
  '/:userId/following',
  authenticate,
  validateUuidParam('userId'),
  validateSkipTakeQuery(),
  followController.getFollowing
);

export default router;
