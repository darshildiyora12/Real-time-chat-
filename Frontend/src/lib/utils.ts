import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMessageTime(date: string | Date): string {
  const messageDate = new Date(date);
  
  if (isToday(messageDate)) {
    return format(messageDate, 'HH:mm');
  } else if (isYesterday(messageDate)) {
    return `Yesterday ${format(messageDate, 'HH:mm')}`;
  } else {
    return format(messageDate, 'MMM d, HH:mm');
  }
}

export function formatLastSeen(date: string | Date): string {
  const lastSeenDate = new Date(date);
  return formatDistanceToNow(lastSeenDate, { addSuffix: true });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function generateRoomName(room: any, currentUserId: string): string {
  if (room.type === 'group') {
    return room.name;
  }
  
  // For personal rooms, show the other person's name
  const otherParticipant = room.participants.find(
    (participant: any) => participant.id !== currentUserId
  );
  
  return otherParticipant?.displayName || 'Unknown User';
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
