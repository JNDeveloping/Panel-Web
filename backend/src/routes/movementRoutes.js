import { Router } from 'express';
import { getDashboard, getMovements, postMovement } from '../controllers/movementController.js';
import { requireAuth } from '../middleware/auth.js';
import { audit } from '../middleware/audit.js';
const router = Router();
router.get('/dashboard', requireAuth, getDashboard);
router.get('/movements', requireAuth, getMovements);
router.post('/movements', requireAuth, audit('create', 'movement'), postMovement);
export default router;
