'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { socketService } from '@/lib/socket';
import { roomsAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Loader2, LogOut, Users, MessageCircle, Plus } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import ChatArea from '@/components/ChatArea';
import CreateRoomModal from '@/components/CreateRoomModal';
import ProfileSection from '@/components/ProfileSection';

export default function ChatPage() {
  const { user, token, isAuthenticated, logout } = useAuthStore();
  const { rooms, setRooms, setUsers, setLoading } = useChatStore();
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push('/auth/login');
      return;
    }

    initializeChat();

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated, token, router]);

  const initializeChat = async () => {
    try {
      setIsLoading(true);
      
      // Connect to socket
      socketService.connect();
      
      // Load initial data
      const [roomsResponse, usersResponse] = await Promise.all([
        roomsAPI.getRooms(),
        roomsAPI.getUsers()
      ]);
      
      setRooms(roomsResponse.rooms);
      setUsers(usersResponse.users);
      
      // Set up socket event listeners
      setupSocketListeners();
      
    } catch (error: any) {
      toast.error('Failed to load chat data');
      console.error('Error initializing chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupSocketListeners = () => {
    // Remove existing listeners first to prevent duplicates
    socketService.removeAllListeners();
    
    // Handle new messages
    socketService.onNewMessage((message) => {
      useChatStore.getState().addMessage(message);
    });

    // Handle user online/offline
    socketService.onUserOnline((data) => {
      useChatStore.getState().addOnlineUser(data.userId);
    });

    socketService.onUserOffline((data) => {
      useChatStore.getState().removeOnlineUser(data.userId);
    });

    // Handle errors
    socketService.onError((error) => {
      toast.error(error.message);
    });
  };

  const handleLogout = async () => {
    try {
      await socketService.disconnect();
      logout();
      router.push('/auth/login');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Nextbase Chat</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsCreateRoomOpen(true)}
                className="btn btn-ghost btn-sm"
                title="Create Room"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                onClick={handleLogout}
                className="btn btn-ghost btn-sm text-red-600 hover:text-red-700"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="p-4 border-b border-gray-200">
          <ProfileSection />
        </div>

        {/* Sidebar Content */}
        <Sidebar />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <ChatArea />
      </div>

      {/* Modals */}
      <CreateRoomModal
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
      />
    </div>
  );
}
