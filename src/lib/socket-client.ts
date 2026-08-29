'use client';

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocketClient() {
  if (!socket) {
    socket = io({
      path: '/api/socket',
      autoConnect: false,
    });
  }
  return socket;
}
