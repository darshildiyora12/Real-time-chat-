import { create } from 'zustand';
import { ChatRoom, Message, User } from '@/types';

interface ChatState {
  rooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  messages: Message[];
  users: User[];
  onlineUsers: Set<string>;
  typingUsers: Map<string, User[]>;
  isLoading: boolean;
  setRooms: (rooms: ChatRoom[]) => void;
  addRoom: (room: ChatRoom) => void;
  setCurrentRoom: (room: ChatRoom | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setUsers: (users: User[]) => void;
  setOnlineUsers: (userIds: string[]) => void;
  addOnlineUser: (userId: string) => void;
  removeOnlineUser: (userId: string) => void;
  setTypingUsers: (roomId: string, users: User[]) => void;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  rooms: [],
  currentRoom: null,
  messages: [],
  users: [],
  onlineUsers: new Set(),
  typingUsers: new Map(),
  isLoading: false,
  
  setRooms: (rooms) => set({ rooms }),
  
  addRoom: (room) => set((state) => ({
    rooms: [room, ...state.rooms]
  })),
  
  setCurrentRoom: (room) => set({ currentRoom: room }),
  
  setMessages: (messages) => set({ messages }),
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  
  setUsers: (users) => set({ users }),
  
  setOnlineUsers: (userIds) => set({ onlineUsers: new Set(userIds) }),
  
  addOnlineUser: (userId) => set((state) => {
    const newOnlineUsers = new Set(state.onlineUsers);
    newOnlineUsers.add(userId);
    return { onlineUsers: newOnlineUsers };
  }),
  
  removeOnlineUser: (userId) => set((state) => {
    const newOnlineUsers = new Set(state.onlineUsers);
    newOnlineUsers.delete(userId);
    return { onlineUsers: newOnlineUsers };
  }),
  
  setTypingUsers: (roomId, users) => set((state) => {
    const newTypingUsers = new Map(state.typingUsers);
    newTypingUsers.set(roomId, users);
    return { typingUsers: newTypingUsers };
  }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  clearMessages: () => set({ messages: [] }),
}));
