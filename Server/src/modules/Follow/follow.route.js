import { Router } from 'express';
import followController from './follow.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

router.post('/:userId', authenticate, followController.sendFollowRequest);
router.patch('/:userId/accept', authenticate, followController.acceptFollowRequest);
router.delete('/:userId/reject', authenticate, followController.rejectFollowRequest);
router.delete('/:userId', authenticate, followController.unfollow);
router.get('/:userId/followers', authenticate, followController.getFollowers);
router.get('/:userId/following', authenticate, followController.getFollowing);
router.get('/pending', authenticate, followController.getPendingRequests);

export default router;
