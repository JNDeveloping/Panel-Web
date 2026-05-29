import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../database/connection.js';
import { config } from '../config.js';

export function login(username, password) {
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND active = 1').get(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) return null;
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
  return { token, user: sanitizeUser(user) };
}

export function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

export function sanitizeUser(user) {
  return { id: user.id, username: user.username, role: user.role, active: Boolean(user.active), created_at: user.created_at };
}

export function listUsers() {
  return db.prepare('SELECT id, username, role, active, created_at FROM users ORDER BY id DESC').all();
}

export function createUser({ username, password, role = 'operator' }) {
  const hash = bcrypt.hashSync(password, 12);
  const result = db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run(username, hash, role);
  return sanitizeUser(db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid));
}
