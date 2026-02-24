import { Router } from 'express';
import userController from './user.controllers.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/me', authenticate, userController.getMe);
router.post('/logout', authenticate, userController.logout);

export default router;
