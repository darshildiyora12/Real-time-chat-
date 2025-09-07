'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Edit2, Camera, X, Save, X as CloseIcon } from 'lucide-react';

export default function ProfileSection() {
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [editData, setEditData] = useState({
    displayName: user?.displayName || '',
    avatar: user?.avatar || ''
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
        setEditData(prev => ({ ...prev, avatar: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setAvatarPreview('');
    setEditData(prev => ({ ...prev, avatar: user?.avatar || '' }));
  };

  const handleEdit = () => {
    setEditData({
      displayName: user?.displayName || '',
      avatar: user?.avatar || ''
    });
    setAvatarPreview('');
    setSelectedFile(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      displayName: user?.displayName || '',
      avatar: user?.avatar || ''
    });
    setAvatarPreview('');
    setSelectedFile(null);
  };

  const handleSave = async () => {
    if (!editData.displayName.trim()) {
      toast.error('Display name is required');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.updateProfile(
        editData.displayName,
        editData.avatar || undefined
      );
      setUser(response.user);
      setIsEditing(false);
      setAvatarPreview('');
      setSelectedFile(null);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="btn btn-ghost btn-sm"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-6">
          {/* Avatar Upload */}
          <div className="text-center">
            <div className="relative inline-block">
              {avatarPreview ? (
                <div className="relative">
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeSelectedFile}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Current avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary-600 flex items-center justify-center text-white text-3xl font-medium">
                      {editData.displayName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
              )}
              
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="profile-avatar-upload"
                />
                <label
                  htmlFor="profile-avatar-upload"
                  className="absolute bottom-0 right-0 w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <Camera className="h-3 w-3" />
                </label>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              {selectedFile ? selectedFile.name : 'Click camera icon to upload new avatar'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Max size: 5MB • JPG, PNG, GIF supported
            </p>
          </div>

          {/* Display Name */}
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={editData.displayName}
              onChange={(e) => setEditData(prev => ({ ...prev, displayName: e.target.value }))}
              className="input w-full"
              placeholder="Enter your display name"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleCancel}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              <CloseIcon className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="btn btn-primary"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Profile Display */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-primary-600 flex items-center justify-center">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-xl font-medium">
                  {user.displayName?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">{user.displayName}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
              <div className="flex items-center mt-1">
                <div className={`w-2 h-2 rounded-full mr-2 ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-xs text-gray-500">
                  {user.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
