import { Router } from 'express';
import userController from './user.controllers.js';
import { authenticate } from '../../middleware/authenticate.js';
import { uploadProfile } from '../../middleware/upload.js';
const router = Router();

/** @route POST /api/auth/register  - Register a new user account */
router.post('/register', userController.register);
/** @route POST /api/auth/login     - Log in with username and password */
router.post('/login', userController.login);
/** @route GET  /api/auth/me        - Get the authenticated user's profile */
router.get('/me', authenticate, userController.getMe);
/** @route GET  /api/auth/profile/:userId - Get profile by user id */
router.get('/profile/:userId', authenticate, userController.getProfile);
/** @route PATCH /api/auth/profile   - Update authenticated user's profile */
router.patch('/profile', authenticate, uploadProfile.single('avatar'), userController.updateProfile);
/** @route POST /api/auth/logout    - Log out and destroy session */
router.post('/logout', authenticate, userController.logout);

export default router;
