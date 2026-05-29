let ioInstance;
export function initSocket(io) {
  ioInstance = io;
  io.on('connection', (socket) => {
    socket.emit('connected', { ok: true });
  });
}
export function broadcast(event, payload) {
  if (ioInstance) ioInstance.emit(event, payload);
}
