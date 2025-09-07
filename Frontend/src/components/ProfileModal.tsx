'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { X, User, Mail, Camera } from 'lucide-react';

const profileSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(50, 'Display name too long'),
  avatar: z.string().url('Invalid URL').optional().or(z.literal('')),
});

type ProfileForm = z.infer<typeof profileSchema>;

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user, setUser } = useAuthStore();
  
  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || '',
      avatar: user?.avatar || '',
    },
  });

  const handleSubmit = async (data: ProfileForm) => {
    setIsLoading(true);
    try {
      const response = await authAPI.updateProfile(
        data.displayName,
        data.avatar || undefined
      );
      setUser(response.user);
      toast.success('Profile updated successfully!');
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Profile Settings</h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={form.handleSubmit(handleSubmit)} className="p-6 space-y-6">
          {/* Avatar */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-medium mx-auto mb-4">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors"
              >
                <Camera className="h-3 w-3" />
              </button>
            </div>
            <p className="text-sm text-gray-500">Click to change avatar</p>
          </div>

          {/* Display Name */}
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...form.register('displayName')}
                type="text"
                className="input pl-10"
                placeholder="Enter your display name"
              />
            </div>
            {form.formState.errors.displayName && (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.displayName.message}
              </p>
            )}
          </div>

          {/* Email (read-only) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={user.email}
                disabled
                className="input pl-10 bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
          </div>

          {/* Avatar URL */}
          <div>
            <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-2">
              Avatar URL (Optional)
            </label>
            <input
              {...form.register('avatar')}
              type="url"
              className="input w-full"
              placeholder="https://example.com/avatar.jpg"
            />
            {form.formState.errors.avatar && (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.avatar.message}
              </p>
            )}
          </div>

          {/* User Stats */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Account Information</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={`font-medium ${user.isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                  {user.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Member since:</span>
                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
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
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
