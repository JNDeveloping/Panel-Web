import { db } from '../database/connection.js';
import { createBackup } from '../services/backupService.js';
import { importMovimientosJson } from '../services/whatsappSyncService.js';

export function getLogs(req, res) {
  const logs = db.prepare('SELECT * FROM audit_logs ORDER BY datetime(created_at) DESC LIMIT 200').all();
  res.json({ logs });
}
export function postBackup(req, res) { res.json({ file: createBackup() }); }
export function postImportJson(req, res) { res.json(importMovimientosJson(req.body?.path)); }
