export interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatRoom {
  _id: string;
  name: string;
  description?: string;
  type: 'group' | 'personal';
  participants: User[];
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  content: string;
  type: 'text' | 'image' | 'file';
  sender: User;
  roomId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface MessagesResponse {
  messages: Message[];
  pagination: PaginationInfo;
}

export interface SocketUser {
  userId: string;
  socketId: string;
  displayName: string;
  avatar?: string;
}

export interface TypingUser {
  id: string;
  displayName: string;
  avatar?: string;
  isTyping: boolean;
}
