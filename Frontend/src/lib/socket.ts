import { io, Socket } from 'socket.io-client';
import { Message, TypingUser } from '@/types';
import { useAuthStore } from '@/store/authStore';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token?: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    const authToken = token || useAuthStore.getState().token;
    if (!authToken) {
      throw new Error('No authentication token available');
    }

    this.token = authToken;
    this.socket = io(SOCKET_URL, {
      auth: {
        token: authToken
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  // Room events
  joinRoom(roomId: string, userId: string): void {
    if (this.socket) {
      this.socket.emit('join_room', { roomId, userId });
    }
  }

  leaveRoom(roomId: string): void {
    if (this.socket) {
      this.socket.emit('leave_room', { roomId });
    }
  }

  // Message events
  sendMessage(roomId: string, content: string, type: 'text' | 'image' | 'file' = 'text'): void {
    if (this.socket) {
      this.socket.emit('send_message', { roomId, content, type });
    }
  }

  onNewMessage(callback: (message: Message) => void): void {
    if (this.socket) {
      // Remove existing listener first
      this.socket.off('new_message');
      this.socket.on('new_message', (data) => {
        callback(data.message);
      });
    }
  }

  // Typing events
  startTyping(roomId: string): void {
    if (this.socket) {
      this.socket.emit('typing_start', { roomId });
    }
  }

  stopTyping(roomId: string): void {
    if (this.socket) {
      this.socket.emit('typing_stop', { roomId });
    }
  }

  onUserTyping(callback: (data: { roomId: string; user: TypingUser }) => void): void {
    if (this.socket) {
      this.socket.on('user_typing', callback);
    }
  }

  // Room events
  onJoinedRoom(callback: (data: { roomId: string; message: string }) => void): void {
    if (this.socket) {
      this.socket.on('joined_room', callback);
    }
  }

  onLeftRoom(callback: (data: { roomId: string; message: string }) => void): void {
    if (this.socket) {
      this.socket.on('left_room', callback);
    }
  }

  onUserJoined(callback: (data: { roomId: string; user: any }) => void): void {
    if (this.socket) {
      this.socket.on('user_joined', callback);
    }
  }

  onUserLeft(callback: (data: { roomId: string; user: any }) => void): void {
    if (this.socket) {
      this.socket.on('user_left', callback);
    }
  }

  onUserOnline(callback: (data: { userId: string; displayName: string }) => void): void {
    if (this.socket) {
      // Remove existing listener first
      this.socket.off('user_online');
      this.socket.on('user_online', callback);
    }
  }

  onUserOffline(callback: (data: { userId: string; displayName: string }) => void): void {
    if (this.socket) {
      // Remove existing listener first
      this.socket.off('user_offline');
      this.socket.on('user_offline', callback);
    }
  }

  // Error handling
  onError(callback: (error: { message: string }) => void): void {
    if (this.socket) {
      // Remove existing listener first
      this.socket.off('error');
      this.socket.on('error', callback);
    }
  }

  // Remove all listeners
  removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

export const socketService = new SocketService();
export default socketService;
