'use client';

import { useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import { roomsAPI } from '@/lib/api';
import { generateRoomName } from '@/lib/utils';
import { MessageCircle, Users, Hash, User } from 'lucide-react';
import { ChatRoom } from '@/types';
import { toast } from 'react-hot-toast';

export default function Sidebar() {
  const { rooms, currentRoom, setCurrentRoom, users, addRoom } = useChatStore();
  const [activeTab, setActiveTab] = useState<'rooms' | 'users'>('rooms');

  const handleRoomSelect = (room: ChatRoom) => {
    setCurrentRoom(room);
  };

  const handleUserSelect = async (user: any) => {
    try {
      // Find existing personal room with this user
      const existingPersonalRoom = rooms.find(
        room => room.type === 'personal' && 
        room.participants.some(p => p.id === user.id)
      );

      if (existingPersonalRoom) {
        setCurrentRoom(existingPersonalRoom);
        return;
      }

      // Create new personal room
      const roomName = `Chat with ${user.displayName}`;
      const response = await roomsAPI.createRoom({
        name: roomName,
        type: 'personal',
        participants: [user.id]
      });

      // Add the new room to the rooms list
      addRoom(response.room);
      
      // Set the new room as current
      setCurrentRoom(response.room);
      
      toast.success(`Started chat with ${user.displayName}`);
    } catch (error: any) {
      if (error.response?.data?.error === 'Personal room already exists between these users') {
        // Find and select the existing room
        const existingRoom = rooms.find(
          room => room.type === 'personal' && 
          room.participants.some(p => p.id === user.id)
        );
        if (existingRoom) {
          setCurrentRoom(existingRoom);
        }
      } else {
        toast.error('Failed to start personal chat');
        console.error('Error creating personal room:', error);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('rooms')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'rooms'
              ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <MessageCircle className="h-4 w-4 inline mr-2" />
          Rooms
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'users'
              ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="h-4 w-4 inline mr-2" />
          Users
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {activeTab === 'rooms' ? (
          <div className="p-2">
            {rooms.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">No rooms yet</p>
                <p className="text-gray-400 text-xs">Create a room to get started</p>
              </div>
            ) : (
              <div className="space-y-1">
                {rooms.map((room) => (
                  <button
                    key={room._id}
                    onClick={() => handleRoomSelect(room)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      currentRoom?._id === room._id
                        ? 'bg-primary-100 text-primary-900'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {room.type === 'group' ? (
                          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                            <Hash className="h-4 w-4 text-white" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {generateRoomName(room, 'current-user-id')}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {room.type === 'group' 
                            ? `${room.participants.length} members`
                            : 'Personal chat'
                          }
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-2">
            {users.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">No users found</p>
              </div>
            ) : (
              <div className="space-y-1">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleUserSelect(user)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-600 flex items-center justify-center">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.displayName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white text-sm font-medium">
                              {user.displayName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.displayName}
                          </p>
                          {user.isOnline && (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
