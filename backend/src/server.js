import http from 'http';
import { Server } from 'socket.io';
import { app } from './app.js';
import { config } from './config.js';
import './database/connection.js';
import { scheduleBackups } from './services/backupService.js';
import { initSocket } from './websocket/socket.js';
import { logger } from './utils/logger.js';

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: config.corsOrigin, credentials: true } });
initSocket(io);
scheduleBackups();
server.listen(config.port, () => logger.info(`Backend listo en http://localhost:${config.port}`));
