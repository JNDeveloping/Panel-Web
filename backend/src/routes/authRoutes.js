import { Router } from 'express';
import { getMe, getUsers, postLogin, postUser } from '../controllers/authController.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
const router = Router();
router.post('/login', postLogin);
router.get('/me', requireAuth, getMe);
router.get('/users', requireAuth, requireAdmin, getUsers);
router.post('/users', requireAuth, requireAdmin, postUser);
export default router;
