import { Router } from 'express';
import { getLogs, postBackup, postImportJson } from '../controllers/adminController.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
const router = Router();
router.get('/logs', requireAuth, requireAdmin, getLogs);
router.post('/backup', requireAuth, requireAdmin, postBackup);
router.post('/import-json', requireAuth, requireAdmin, postImportJson);
export default router;
