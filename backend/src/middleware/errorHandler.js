import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';

export function notFound(req, res) {
  res.status(404).json({ message: 'Ruta no encontrada' });
}

export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) return res.status(422).json({ message: 'Validación inválida', errors: err.flatten() });
  logger.error(err.message, { stack: err.stack, path: req.path });
  res.status(err.status || 500).json({ message: err.message || 'Error interno' });
}
