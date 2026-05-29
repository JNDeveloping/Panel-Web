import { Router } from 'express';
import { postBotSync } from '../controllers/botController.js';
const router = Router();
router.post('/bot/sync', postBotSync);
export default router;
