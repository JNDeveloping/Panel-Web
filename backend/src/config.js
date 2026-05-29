import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..', '..');

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  databasePath: path.resolve(root, process.env.DATABASE_PATH || 'database/panel.sqlite'),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '12h',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  adminUser: process.env.ADMIN_USER || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
  movimientosJsonPath: path.resolve(root, process.env.MOVIMIENTOS_JSON_PATH || 'movimientos.json'),
  backupCron: process.env.BACKUP_CRON || '0 3 * * *',
  backupDir: path.resolve(root, 'backend/backups')
};
