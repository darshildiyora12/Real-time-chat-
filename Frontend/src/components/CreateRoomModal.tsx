'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useChatStore } from '@/store/chatStore';
import { roomsAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { X, Hash, User, Users } from 'lucide-react';

const createRoomSchema = z.object({
  name: z.string().min(1, 'Room name is required').max(100, 'Room name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  type: z.enum(['group', 'personal']),
  participants: z.array(z.string()).min(1, 'Select at least one participant'),
}).refine((data) => {
  if (data.type === 'personal' && data.participants.length !== 1) {
    return false;
  }
  return true;
}, {
  message: "Personal chat must have exactly one participant",
  path: ["participants"],
}).refine((data) => {
  // For personal chats, name is auto-generated, so we don't validate it
  if (data.type === 'personal') {
    return true;
  }
  // For group chats, name is required
  return data.name && data.name.trim().length > 0;
}, {
  message: "Room name is required for group chats",
  path: ["name"],
});

type CreateRoomForm = z.infer<typeof createRoomSchema>;

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateRoomModal({ isOpen, onClose }: CreateRoomModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { users, addRoom } = useChatStore();
  
  
  const form = useForm<CreateRoomForm>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      type: 'group',
      participants: [],
    },
  });

  const { watch, setValue } = form;
  const roomType = watch('type');
  const selectedParticipants = watch('participants');
  

  const handleSubmit = async (data: CreateRoomForm) => {
    setIsLoading(true);
    try {
      // Auto-generate name for personal chats
      let roomData = { ...data };
      if (data.type === 'personal') {
        const selectedUser = users.find(user => user.id === data.participants[0]);
        roomData.name = `Chat with ${selectedUser?.displayName || 'User'}`;
        roomData.description = undefined; // Remove description for personal chats
      }

      const response = await roomsAPI.createRoom(roomData);
      addRoom(response.room);
      toast.success(`${data.type === 'personal' ? 'Personal chat' : 'Room'} created successfully!`);
      onClose();
      form.reset();
    } catch (error: any) {
      if (error.response?.data?.error === 'Personal room already exists between these users') {
        toast.error('Personal chat already exists with this user');
      } else {
        toast.error(error.response?.data?.error || 'Failed to create room');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleParticipantToggle = (userId: string) => {
    const current = selectedParticipants;
    
    if (roomType === 'personal') {
      // For personal chat, toggle selection (can select or unselect)
      if (current.includes(userId)) {
        // If user is already selected, unselect them
        setValue('participants', []);
      } else {
        // If user is not selected, select only them (replace any existing selection)
        setValue('participants', [userId]);
      }
    } else {
      // For group chat, allow multiple participants
      const updated = current.includes(userId)
        ? current.filter(id => id !== userId)
        : [...current, userId];
      setValue('participants', updated);
    }
  };

  const handleTypeChange = (type: 'group' | 'personal') => {
    setValue('type', type);
    
    if (type === 'personal') {
      // Clear all participants when switching to personal chat
      setValue('participants', []);
    }
    
    // Set default name for personal chats to avoid validation errors
    if (type === 'personal') {
      setValue('name', 'Personal Chat'); // Temporary name, will be replaced in handleSubmit
    } else {
      setValue('name', ''); // Clear name for group chats
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Create New Room</h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={form.handleSubmit(handleSubmit)} className="p-6 space-y-6">
          {/* Room Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Room Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange('group')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  roomType === 'group'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Hash className="h-6 w-6 mb-2" />
                <div className="font-medium">Group Chat</div>
                <div className="text-sm text-gray-500">Multiple participants</div>
              </button>
              
              <button
                type="button"
                onClick={() => handleTypeChange('personal')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  roomType === 'personal'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <User className="h-6 w-6 mb-2" />
                <div className="font-medium">Personal Chat</div>
                <div className="text-sm text-gray-500">One-on-one</div>
              </button>
            </div>
          </div>

          {/* Room Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Room Name
            </label>
            <input
              {...form.register('name')}
              type="text"
              className="input w-full"
              placeholder={roomType === 'personal' ? 'Auto-generated' : 'Enter room name'}
              disabled={roomType === 'personal'}
              value={roomType === 'personal' ? 'Personal Chat' : undefined}
            />
            {roomType === 'personal' && (
              <p className="mt-1 text-xs text-gray-500">
                Room name will be auto-generated based on selected user
              </p>
            )}
            {form.formState.errors.name && (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Description (only for group) */}
          {roomType === 'group' && (
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                {...form.register('description')}
                rows={3}
                className="input w-full resize-none"
                placeholder="Enter room description"
              />
              {form.formState.errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>
          )}

          {/* Participants */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {roomType === 'personal' ? 'Select User' : 'Select Participants'}
            </label>
            {roomType === 'personal' && (
              <p className="text-xs text-gray-500 mb-2">
                Choose one user to start a personal chat with
              </p>
            )}
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
              {users.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p>No users available</p>
                  <p className="text-xs">Make sure users are loaded</p>
                </div>
              ) : (
                users.map((user) => {
                  console.log('Rendering user:', { id: user.id, name: user.displayName, isSelected: selectedParticipants.includes(user.id) });
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        console.log('Button clicked for user:', user.id, user.displayName);
                        handleParticipantToggle(user.id);
                      }}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedParticipants.includes(user.id)
                          ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                          : 'hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {user.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {user.displayName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.email}
                          </p>
                        </div>
                        {user.isOnline && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            {form.formState.errors.participants && (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.participants.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
            >
              {isLoading ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
