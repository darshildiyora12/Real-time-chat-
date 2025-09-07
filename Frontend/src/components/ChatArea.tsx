'use client';

import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { socketService } from '@/lib/socket';
import { roomsAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { formatMessageTime, generateRoomName } from '@/lib/utils';
import { MoreVertical, Users, Hash, User, MessageCircle, X, Settings, Bell, LogOut } from 'lucide-react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

export default function ChatArea() {
  const { currentRoom, messages, setMessages, setCurrentRoom } = useChatStore();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showRoomOptions, setShowRoomOptions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentRoom) {
      loadMessages();
      joinRoom();
    } else {
      setMessages([]);
    }
  }, [currentRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    if (!currentRoom) return;

    try {
      setIsLoading(true);
      const response = await roomsAPI.getMessages(currentRoom._id);
      setMessages(response.messages);
    } catch (error: any) {
      toast.error('Failed to load messages');
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const joinRoom = () => {
    if (currentRoom && user) {
      socketService.joinRoom(currentRoom._id, user.id);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRoomOption = (option: string) => {
    switch (option) {
      case 'participants':
        setShowRoomOptions(false);
        setShowParticipants(true);
        break;
      case 'settings':
        toast.success('Room settings coming soon!');
        setShowRoomOptions(false);
        break;
      case 'notifications':
        toast.success('Notification settings coming soon!');
        setShowRoomOptions(false);
        break;
      case 'leave':
        toast.success('Leave room functionality coming soon!');
        setShowRoomOptions(false);
        break;
      default:
        break;
    }
  };

  if (!currentRoom) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to Nextbase Chat</h3>
          <p className="text-gray-500">Select a room or start a conversation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {currentRoom.type === 'group' ? (
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Hash className="h-5 w-5 text-white" />
                </div>
              ) : (
                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 truncate">
                {generateRoomName(currentRoom, user?.id || '')}
              </h2>
              <p className="text-sm text-gray-500 truncate">
                {currentRoom.type === 'group' 
                  ? `${currentRoom.participants.length} members`
                  : 'Personal chat'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              className="btn btn-ghost btn-sm"
              onClick={() => setShowParticipants(true)}
              title="View participants"
            >
              <Users className="h-4 w-4" />
            </button>
            <button 
              className="btn btn-ghost btn-sm"
              onClick={() => setShowRoomOptions(true)}
              title="Room options"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <MessageList 
          messages={messages} 
          isLoading={isLoading}
          onLoadMore={loadMessages}
        />
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <MessageInput 
          roomId={currentRoom._id}
          onMessageSent={() => scrollToBottom()}
        />
      </div>

      {/* Participants Modal */}
      {showParticipants && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Participants</h2>
              <button
                onClick={() => setShowParticipants(false)}
                className="btn btn-ghost btn-sm p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-3">
                {currentRoom.participants.map((participant: { id: string; displayName?: string; email?: string }) => (
                  <div key={participant.id} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {participant.displayName?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{participant.displayName}</p>
                      <p className="text-sm text-gray-500">{participant.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Room Options Modal */}
      {showRoomOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Room Options</h2>
              <button
                onClick={() => setShowRoomOptions(false)}
                className="btn btn-ghost btn-sm p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <button 
                  onClick={() => handleRoomOption('participants')}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 flex items-center space-x-3"
                >
                  <Users className="h-5 w-5 text-gray-400" />
                  <span>View all participants</span>
                </button>
                <button 
                  onClick={() => handleRoomOption('settings')}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 flex items-center space-x-3"
                >
                  <Settings className="h-5 w-5 text-gray-400" />
                  <span>Room settings</span>
                </button>
                <button 
                  onClick={() => handleRoomOption('notifications')}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 flex items-center space-x-3"
                >
                  <Bell className="h-5 w-5 text-gray-400" />
                  <span>Notification settings</span>
                </button>
                <button 
                  onClick={() => handleRoomOption('leave')}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 flex items-center space-x-3"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Leave room</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
