import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';

export function createBackup() {
  fs.mkdirSync(config.backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const target = path.join(config.backupDir, `panel-${stamp}.sqlite`);
  fs.copyFileSync(config.databasePath, target);
  return target;
}

export function scheduleBackups() {
  cron.schedule(config.backupCron, () => {
    try { logger.info(`Backup created: ${createBackup()}`); }
    catch (error) { logger.error('Backup failed', { error: error.message }); }
  });
}
