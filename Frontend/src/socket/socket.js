import { io } from 'socket.io-client';

let socket = null;
let connectedUserId = null;
let pendingWorkspaceId = null;

const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export const connectSocket = (userId) => {
  if (!userId) return null;

  if (socket?.connected && connectedUserId === userId) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
  }

  socket = io(socketUrl, {
    withCredentials: true,
    transports: ['websocket', 'polling'],
  });

  connectedUserId = userId;

  socket.on('connect', () => {
    socket.emit('join', userId);

    if (pendingWorkspaceId) {
      socket.emit('joinWorkspace', pendingWorkspaceId);
    }
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }

  socket = null;
  connectedUserId = null;
  pendingWorkspaceId = null;
};

export const joinWorkspaceRoom = (workspaceId) => {
  if (!workspaceId) return;
  
  pendingWorkspaceId = workspaceId;

  if (socket?.connected) {
    socket.emit('joinWorkspace', workspaceId);
  }
};

export const getSocket = () => socket;
