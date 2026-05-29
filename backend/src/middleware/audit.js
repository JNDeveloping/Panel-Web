import { db } from '../database/connection.js';

export function audit(action, entity) {
  return (req, res, next) => {
    res.on('finish', () => {
      if (res.statusCode < 400) {
        db.prepare('INSERT INTO audit_logs (user_id, action, entity, entity_id, metadata, ip) VALUES (?, ?, ?, ?, ?, ?)')
          .run(req.user?.id || null, action, entity, req.params.id || null, JSON.stringify({ body: req.body, query: req.query }), req.ip);
      }
    });
    next();
  };
}
