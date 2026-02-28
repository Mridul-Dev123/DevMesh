import { Router } from 'express';
import userController from './user.controllers.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

/** @route POST /api/auth/register  - Register a new user account */
router.post('/register', userController.register);
/** @route POST /api/auth/login     - Log in with username and password */
router.post('/login', userController.login);
/** @route GET  /api/auth/me        - Get the authenticated user's profile */
router.get('/me', authenticate, userController.getMe);
/** @route POST /api/auth/logout    - Log out and destroy session */
router.post('/logout', authenticate, userController.logout);

export default router;
