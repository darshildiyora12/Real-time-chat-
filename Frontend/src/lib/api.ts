import axios from 'axios';
import { AuthResponse, User, ChatRoom, MessagesResponse, ApiResponse } from '@/types';
import { useAuthStore } from '@/store/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (email: string, password: string, displayName: string, avatar?: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', { email, password, displayName, avatar });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getProfile: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (displayName?: string, avatar?: string): Promise<{ user: User }> => {
    const response = await api.put('/auth/profile', { displayName, avatar });
    return response.data;
  },
};

export const roomsAPI = {
  getRooms: async (): Promise<{ rooms: ChatRoom[] }> => {
    const response = await api.get('/rooms');
    return response.data;
  },

  getRoom: async (roomId: string): Promise<{ room: ChatRoom }> => {
    const response = await api.get(`/rooms/${roomId}`);
    return response.data;
  },

  createRoom: async (data: {
    name: string;
    description?: string;
    type: 'group' | 'personal';
    participants: string[];
  }): Promise<{ room: ChatRoom }> => {
    const response = await api.post('/rooms', data);
    return response.data;
  },

  updateRoom: async (roomId: string, data: {
    name?: string;
    description?: string;
  }): Promise<{ room: ChatRoom }> => {
    const response = await api.put(`/rooms/${roomId}`, data);
    return response.data;
  },

  deleteRoom: async (roomId: string): Promise<void> => {
    await api.delete(`/rooms/${roomId}`);
  },

  getMessages: async (roomId: string, page = 1, limit = 50): Promise<MessagesResponse> => {
    const response = await api.get(`/rooms/${roomId}/messages`, {
      params: { page, limit }
    });
    return response.data;
  },

  getUsers: async (): Promise<{ users: User[] }> => {
    const response = await api.get('/users');
    return response.data;
  },
};

export default api;
