'use client';

import { useState, useRef, useEffect } from 'react';
import { socketService } from '@/lib/socket';
import { useChatStore } from '@/store/chatStore';
import { debounce } from '@/lib/utils';
import { Send, Smile, Paperclip } from 'lucide-react';

interface MessageInputProps {
  roomId: string;
  onMessageSent: () => void;
}

export default function MessageInput({ roomId, onMessageSent }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { setTypingUsers, typingUsers } = useChatStore();

  // Debounced typing handlers
  const startTyping = debounce(() => {
    if (!isTyping) {
      setIsTyping(true);
      socketService.startTyping(roomId);
    }
  }, 300);

  const stopTyping = debounce(() => {
    if (isTyping) {
      setIsTyping(false);
      socketService.stopTyping(roomId);
    }
  }, 1000);

  useEffect(() => {
    // Set up typing event listeners
    const handleUserTyping = (data: any) => {
      if (data.roomId === roomId) {
        // Update typing users in store
        const currentTyping = typingUsers.get(roomId) || [];
        const updatedTyping = data.user.isTyping
          ? [...currentTyping.filter(u => u.id !== data.user.id), data.user]
          : currentTyping.filter(u => u.id !== data.user.id);
        
        setTypingUsers(roomId, updatedTyping);
      }
    };

    socketService.onUserTyping(handleUserTyping);

    return () => {
      // Clean up typing state when component unmounts
      if (isTyping) {
        socketService.stopTyping(roomId);
      }
      // Remove the specific listener
      socketService.getSocket()?.off('user_typing', handleUserTyping);
    };
  }, [roomId, isTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    if (value.trim()) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    // Send message via socket
    socketService.sendMessage(roomId, trimmedMessage, 'text');
    
    // Clear input
    setMessage('');
    
    // Stop typing
    if (isTyping) {
      setIsTyping(false);
      socketService.stopTyping(roomId);
    }

    // Notify parent
    onMessageSent();
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  return (
    <div className="flex items-end space-x-3">
      {/* Attachment Button */}
      <button className="btn btn-ghost btn-sm p-2 text-gray-400 hover:text-gray-600">
        <Paperclip className="h-5 w-5" />
      </button>

      {/* Message Input */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent scrollbar-thin"
          rows={1}
          style={{ minHeight: '44px', maxHeight: '120px' }}
        />
        
        {/* Emoji Button */}
        <button className="absolute right-3 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-sm p-1 text-gray-400 hover:text-gray-600">
          <Smile className="h-5 w-5" />
        </button>
      </div>

      {/* Send Button */}
      <button
        onClick={handleSendMessage}
        disabled={!message.trim()}
        className="btn btn-primary btn-sm p-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send className="h-4 w-4" />
      </button>
    </div>
  );
}
