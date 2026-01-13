import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
let socket = null;

export function initSocket() {
  if (socket) return socket;

  socket = io(API_BASE, {
    path: '/api/socket/socket.io/',
    withCredentials: true,
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.debug('Socket connected', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.debug('Socket disconnected', reason);
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connect error', err);
  });

  return socket;
}

export function getSocket() {
  return socket;
}
