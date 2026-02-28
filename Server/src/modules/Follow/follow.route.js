import { Router } from 'express';
import followController from './follow.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

/** @route POST   /api/follow/:userId               - Send a follow request */
router.post('/:userId', authenticate, followController.sendFollowRequest);
/** @route PATCH  /api/follow/:userId/accept        - Accept a follow request */
router.patch('/:userId/accept', authenticate, followController.acceptFollowRequest);
/** @route DELETE /api/follow/:userId/reject        - Reject a follow request */
router.delete('/:userId/reject', authenticate, followController.rejectFollowRequest);
/** @route DELETE /api/follow/:userId               - Unfollow a user */
router.delete('/:userId', authenticate, followController.unfollow);
/** @route GET    /api/follow/:userId/followers     - Get a user's followers (query: skip, take) */
router.get('/:userId/followers', authenticate, followController.getFollowers);
/** @route GET    /api/follow/:userId/following     - Get users a user follows (query: skip, take) */
router.get('/:userId/following', authenticate, followController.getFollowing);
/** @route GET    /api/follow/pending               - Get pending follow requests for the authenticated user */
router.get('/pending', authenticate, followController.getPendingRequests);

export default router;
