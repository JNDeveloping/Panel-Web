import { z } from 'zod';
import { broadcast } from '../websocket/socket.js';
import { ingestWhatsAppCommand } from '../services/whatsappSyncService.js';
import { getDashboardStats } from '../services/movementService.js';

const schema = z.object({
  external_id: z.string().optional(), messageId: z.string().optional(), type: z.enum(['entra','sale','parcial','ingreso','vacio','maco']),
  responsible: z.string().optional(), user: z.string().optional(), amount: z.coerce.number().min(0).optional(),
  envelopes: z.coerce.number().int().min(0).optional(), note: z.string().optional(), text: z.string().optional(), created_at: z.string().optional()
});

export function postBotSync(req, res) {
  const result = ingestWhatsAppCommand(schema.parse(req.body));
  const dashboard = getDashboardStats();
  if (!result.duplicated) broadcast('movement:created', { movement: result.movement, dashboard });
  res.status(result.duplicated ? 200 : 201).json({ ...result, dashboard });
}
