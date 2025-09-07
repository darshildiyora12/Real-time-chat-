export interface User {
  _id: string;
  email: string;
  password: string;
  displayName: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatRoom {
  _id: string;
  name: string;
  description?: string;
  type: 'group' | 'personal';
  participants: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  _id: string;
  content: string;
  sender: string;
  roomId: string;
  type: 'text' | 'image' | 'file';
  createdAt: Date;
  updatedAt: Date;
}

export interface SocketUser {
  userId: string;
  socketId: string;
  displayName: string;
  avatar?: string;
}

export interface JoinRoomData {
  roomId: string;
  userId: string;
}

export interface SendMessageData {
  roomId: string;
  content: string;
  type?: 'text' | 'image' | 'file';
}

export interface CreateRoomData {
  name: string;
  description?: string;
  type: 'group' | 'personal';
  participants: string[];
}

export interface AuthRequest {
  user: {
    userId: string;
    email: string;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}
