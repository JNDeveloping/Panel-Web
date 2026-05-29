import { z } from 'zod';
import { createUser, listUsers, login } from '../auth/authService.js';

export function postLogin(req, res) {
  const body = z.object({ username: z.string().min(2), password: z.string().min(4) }).parse(req.body);
  const result = login(body.username, body.password);
  if (!result) return res.status(401).json({ message: 'Credenciales inválidas' });
  res.json(result);
}
export function getMe(req, res) { res.json({ user: req.user }); }
export function getUsers(req, res) { res.json({ users: listUsers() }); }
export function postUser(req, res) {
  const body = z.object({ username: z.string().min(3), password: z.string().min(6), role: z.enum(['admin','operator']).default('operator') }).parse(req.body);
  res.status(201).json({ user: createUser(body) });
}
