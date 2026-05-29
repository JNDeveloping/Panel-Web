import fs from 'fs';
import { db } from '../database/connection.js';
import { config } from '../config.js';
import { createMovement } from './movementService.js';

export function ingestWhatsAppCommand(payload) {
  const externalId = payload.external_id || payload.messageId || null;
  if (externalId && db.prepare('SELECT id FROM sync_events WHERE external_id = ?').get(externalId)) return { duplicated: true };
  const movement = createMovement({
    type: payload.type,
    responsible: payload.responsible || payload.user || 'WhatsApp',
    amount: payload.amount || 0,
    envelopes: payload.envelopes || 0,
    note: payload.note || payload.text || null,
    source: 'whatsapp',
    created_at: payload.created_at
  });
  db.prepare('INSERT INTO sync_events (external_id, payload, source) VALUES (?, ?, ?)').run(externalId, JSON.stringify(payload), 'whatsapp');
  return { duplicated: false, movement };
}

export function importMovimientosJson(file = config.movimientosJsonPath) {
  if (!fs.existsSync(file)) return { imported: 0, file, exists: false };
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const items = Array.isArray(data) ? data : data.movimientos || [];
  let imported = 0;
  for (const item of items) {
    const type = String(item.type || item.tipo || '').toLowerCase();
    if (!type) continue;
    createMovement({
      type,
      responsible: item.responsible || item.responsable || item.usuario || 'Importado',
      amount: item.amount || item.monto || item.dinero || 0,
      envelopes: item.envelopes || item.sobres || 0,
      note: item.note || item.detalle || 'Importado desde movimientos.json',
      source: 'import',
      created_at: item.created_at || item.fecha
    });
    imported += 1;
  }
  return { imported, file, exists: true };
}
