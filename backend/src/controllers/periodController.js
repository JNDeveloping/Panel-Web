import { listPeriods } from '../services/movementService.js';
import { periodExcel, periodPdf } from '../services/exportService.js';

export function getPeriods(req, res) { res.json({ periods: listPeriods() }); }
export function exportPeriodExcel(req, res) { return periodExcel(req.params.id, res); }
export function exportPeriodPdf(req, res) { return periodPdf(req.params.id, res); }
