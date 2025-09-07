import 'dotenv/config';
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import ChatRoom from '../models/ChatRoom';
import Message from '../models/Message';
import { SocketUser, JoinRoomData, SendMessageData } from '../types';

class SocketHandler {
  private io: SocketIOServer;
  private connectedUsers: Map<string, SocketUser> = new Map();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-here') as { userId: string; email: string };
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
          return next(new Error('User not found'));
        }

        socket.data.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.data.user.displayName} (${socket.id})`);
      
      // Store connected user
      this.connectedUsers.set(socket.id, {
        userId: socket.data.user._id.toString(),
        socketId: socket.id,
        displayName: socket.data.user.displayName,
        avatar: socket.data.user.avatar
      });

      // Update user online status
      this.updateUserOnlineStatus(socket.data.user._id.toString(), true);

      // Join user to their personal room (for notifications)
      socket.join(`user_${socket.data.user._id}`);

      // Get user's rooms and join them
      this.joinUserRooms(socket);

      // Handle joining a specific room
      socket.on('join_room', async (data: JoinRoomData) => {
        await this.handleJoinRoom(socket, data);
      });

      // Handle leaving a room
      socket.on('leave_room', (data: { roomId: string }) => {
        this.handleLeaveRoom(socket, data.roomId);
      });

      // Handle sending messages
      socket.on('send_message', async (data: SendMessageData) => {
        await this.handleSendMessage(socket, data);
      });

      // Handle typing indicators
      socket.on('typing_start', (data: { roomId: string }) => {
        this.handleTypingStart(socket, data.roomId);
      });

      socket.on('typing_stop', (data: { roomId: string }) => {
        this.handleTypingStop(socket, data.roomId);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  private async joinUserRooms(socket: any) {
    try {
      const userId = socket.data.user._id.toString();
      const rooms = await ChatRoom.find({ participants: userId });
      
      rooms.forEach(room => {
        socket.join((room._id as any).toString());
      });
    } catch (error) {
      console.error('Error joining user rooms:', error);
    }
  }

  private async handleJoinRoom(socket: any, data: JoinRoomData) {
    try {
      const { roomId, userId } = data;
      
      // Verify user has access to the room
      const room = await ChatRoom.findOne({ _id: roomId, participants: userId });
      if (!room) {
        socket.emit('error', { message: 'Room not found or access denied' });
        return;
      }

      socket.join(roomId);
      socket.emit('joined_room', { roomId, message: 'Successfully joined room' });
      
      // Notify others in the room
      socket.to(roomId).emit('user_joined', {
        roomId,
        user: {
          id: socket.data.user._id,
          displayName: socket.data.user.displayName,
          avatar: socket.data.user.avatar
        }
      });
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  }

  private handleLeaveRoom(socket: any, roomId: string) {
    socket.leave(roomId);
    socket.emit('left_room', { roomId, message: 'Successfully left room' });
    
    // Notify others in the room
    socket.to(roomId).emit('user_left', {
      roomId,
      user: {
        id: socket.data.user._id,
        displayName: socket.data.user.displayName,
        avatar: socket.data.user.avatar
      }
    });
  }

  private async handleSendMessage(socket: any, data: SendMessageData) {
    try {
      const { roomId, content, type = 'text' } = data;
      const userId = socket.data.user._id.toString();
      
      // Verify user has access to the room
      const room = await ChatRoom.findOne({ _id: roomId, participants: userId });
      if (!room) {
        socket.emit('error', { message: 'Room not found or access denied' });
        return;
      }

      // Create message
      const message = new Message({
        content,
        sender: userId,
        roomId,
        type
      });

      await message.save();
      await message.populate('sender', 'displayName email avatar');

      // Emit message to all users in the room
      this.io.to(roomId).emit('new_message', {
        message: {
          id: message._id,
          content: message.content,
          type: message.type,
          sender: message.sender,
          roomId: message.roomId,
          createdAt: message.createdAt
        }
      });

      // Update room's updatedAt timestamp
      await ChatRoom.findByIdAndUpdate(roomId, { updatedAt: new Date() });

    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  private handleTypingStart(socket: any, roomId: string) {
    socket.to(roomId).emit('user_typing', {
      roomId,
      user: {
        id: socket.data.user._id,
        displayName: socket.data.user.displayName,
        avatar: socket.data.user.avatar
      },
      isTyping: true
    });
  }

  private handleTypingStop(socket: any, roomId: string) {
    socket.to(roomId).emit('user_typing', {
      roomId,
      user: {
        id: socket.data.user._id,
        displayName: socket.data.user.displayName,
        avatar: socket.data.user.avatar
      },
      isTyping: false
    });
  }

  private async handleDisconnect(socket: any) {
    console.log(`User disconnected: ${socket.data.user.displayName} (${socket.id})`);
    
    // Remove from connected users
    this.connectedUsers.delete(socket.id);
    
    // Update user online status
    await this.updateUserOnlineStatus(socket.data.user._id.toString(), false);
    
    // Notify all rooms the user was in
    const rooms = await ChatRoom.find({ participants: socket.data.user._id });
    rooms.forEach(room => {
      socket.to((room._id as any).toString()).emit('user_offline', {
        userId: socket.data.user._id.toString(),
        displayName: socket.data.user.displayName
      });
    });
  }

  private async updateUserOnlineStatus(userId: string, isOnline: boolean) {
    try {
      await User.findByIdAndUpdate(userId, { 
        isOnline, 
        lastSeen: new Date() 
      });
    } catch (error) {
      console.error('Error updating user online status:', error);
    }
  }

  // Method to get connected users count
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Method to get connected users
  getConnectedUsers(): SocketUser[] {
    return Array.from(this.connectedUsers.values());
  }

  // Method to emit to specific room
  emitToRoom(roomId: string, event: string, data: any) {
    this.io.to(roomId).emit(event, data);
  }

  // Method to emit to specific user
  emitToUser(userId: string, event: string, data: any) {
    this.io.to(`user_${userId}`).emit(event, data);
  }

  // Method to get Socket.IO instance
  getSocket() {
    return this.io;
  }
}

export default SocketHandler;
