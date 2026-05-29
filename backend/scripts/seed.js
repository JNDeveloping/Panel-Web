import bcrypt from 'bcryptjs';
import { db } from '../src/database/connection.js';
import { config } from '../src/config.js';

const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(config.adminUser);
if (!exists) {
  const hash = bcrypt.hashSync(config.adminPassword, 12);
  db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run(config.adminUser, hash, 'admin');
  console.log(`Admin user created: ${config.adminUser}`);
} else {
  console.log('Admin user already exists');
}

const activePeriod = db.prepare('SELECT id FROM periods WHERE ended_at IS NULL ORDER BY id DESC LIMIT 1').get();
if (!activePeriod) {
  db.prepare('INSERT INTO periods (name, created_by) VALUES (?, ?)').run('Período inicial', 'seed');
  console.log('Initial period created');
}
