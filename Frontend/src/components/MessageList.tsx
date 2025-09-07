'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { formatMessageTime, getInitials } from '@/lib/utils';
import { Message } from '@/types';
import { Loader2 } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  onLoadMore: () => void;
}

export default function MessageList({ messages, isLoading, onLoadMore }: MessageListProps) {
  const { user } = useAuthStore();
  const { typingUsers } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    if (scrollTop === 0 && !isLoadingMore) {
      setIsLoadingMore(true);
      onLoadMore();
      setTimeout(() => setIsLoadingMore(false), 1000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-gray-500">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💬</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
          <p className="text-gray-500">Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4"
      onScroll={handleScroll}
    >
      {isLoadingMore && (
        <div className="flex justify-center py-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
        </div>
      )}
      
      {messages.map((message, index) => {
        const isOwn = message.sender.id === user?.id;
        const prevMessage = messages[index - 1];
        const showAvatar = !prevMessage || prevMessage.sender.id !== message.sender.id;
        const showTime = !prevMessage || 
          new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() > 5 * 60 * 1000; // 5 minutes

        return (
          <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              {!isOwn && (
                <div className="flex-shrink-0 mr-3">
                  {showAvatar ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-600 flex items-center justify-center">
                      {message.sender.avatar ? (
                        <img
                          src={message.sender.avatar}
                          alt={message.sender.displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-sm font-medium">
                          {getInitials(message.sender.displayName)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="w-8 h-8" />
                  )}
                </div>
              )}

              {/* Message Content */}
              <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                {/* Sender Name */}
                {!isOwn && showAvatar && (
                  <p className="text-xs text-gray-500 mb-1 px-1">
                    {message.sender.displayName}
                  </p>
                )}

                {/* Message Bubble */}
                <div
                  className={`px-4 py-2 rounded-2xl ${
                    isOwn
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>

                {/* Timestamp */}
                {showTime && (
                  <p className={`text-xs text-gray-400 mt-1 px-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                    {formatMessageTime(message.createdAt)}
                  </p>
                )}
              </div>

              {/* Own Avatar */}
              {isOwn && (
                <div className="flex-shrink-0 ml-3">
                  {showAvatar ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-600 flex items-center justify-center">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-sm font-medium">
                          {getInitials(user?.displayName || 'U')}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="w-8 h-8" />
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Typing Indicator */}
      {typingUsers.size > 0 && (
        <div className="flex justify-start">
          <div className="flex items-center space-x-2 bg-gray-100 rounded-2xl px-4 py-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-xs text-gray-500">
              {Array.from(typingUsers.values()).flat().length} typing...
            </span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
