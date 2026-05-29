import { Router } from 'express';
import { exportPeriodExcel, exportPeriodPdf, getPeriods } from '../controllers/periodController.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
router.get('/periods', requireAuth, getPeriods);
router.get('/periods/:id/export.xlsx', requireAuth, exportPeriodExcel);
router.get('/periods/:id/export.pdf', requireAuth, exportPeriodPdf);
export default router;
