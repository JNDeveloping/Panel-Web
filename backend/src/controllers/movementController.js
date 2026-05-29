import { z } from 'zod';
import { broadcast } from '../websocket/socket.js';
import { createMovement, getDashboardStats, listMovements, MOVEMENT_TYPES } from '../services/movementService.js';

const movementSchema = z.object({
  type: z.enum(MOVEMENT_TYPES), responsible: z.string().min(2), amount: z.coerce.number().min(0).default(0),
  envelopes: z.coerce.number().int().min(0).default(0), note: z.string().optional(), created_at: z.string().optional()
});

export function getDashboard(req, res) { res.json(getDashboardStats()); }
export function getMovements(req, res) { res.json(listMovements(req.query)); }
export function postMovement(req, res) {
  const movement = createMovement({ ...movementSchema.parse(req.body), source: 'web' });
  const dashboard = getDashboardStats();
  broadcast('movement:created', { movement, dashboard });
  res.status(201).json({ movement, dashboard });
}
