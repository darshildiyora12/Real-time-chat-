import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import ChatRoom from '../models/ChatRoom';
import User from '../models/User';
import Message from '../models/Message';

const createRoomSchema = z.object({
  name: z.string().min(1, 'Room name is required').max(100, 'Room name cannot exceed 100 characters'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  type: z.enum(['group', 'personal']),
  participants: z.array(z.string()).min(1, 'At least one participant is required')
});

const updateRoomSchema = z.object({
  name: z.string().min(1, 'Room name is required').max(100, 'Room name cannot exceed 100 characters').optional(),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional()
});

const paginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('20')
});

export default async function roomRoutes(fastify: FastifyInstance) {
  // Create a new room
  fastify.post('/rooms', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { name, description, type, participants } = createRoomSchema.parse(request.body);
      const userId = (request as any).user.userId;
      
      // Validate participants exist
      const participantIds = [...participants, userId];
      const uniqueParticipants = [...new Set(participantIds)];
      
      if (type === 'personal' && uniqueParticipants.length !== 2) {
        return reply.status(400).send({ error: 'Personal rooms must have exactly 2 participants' });
      }
      
      // Check if personal room already exists between these users
      if (type === 'personal') {
        const existingPersonalRoom = await ChatRoom.findOne({
          type: 'personal',
          participants: { $all: uniqueParticipants }
        });
        
        if (existingPersonalRoom) {
          return reply.status(400).send({ error: 'Personal room already exists between these users' });
        }
      }
      
      // Verify all participants exist
      const existingUsers = await User.find({ _id: { $in: uniqueParticipants } });
      if (existingUsers.length !== uniqueParticipants.length) {
        return reply.status(400).send({ error: 'One or more participants not found' });
      }
      
      const room = new ChatRoom({
        name,
        description,
        type,
        participants: uniqueParticipants,
        createdBy: userId
      });
      
      await room.save();
      await room.populate('participants', 'displayName email avatar isOnline');
      
      reply.status(201).send({ message: 'Room created successfully', room });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get all rooms for current user
  fastify.get('/rooms', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      
      const rooms = await ChatRoom.find({ participants: userId })
        .populate('participants', 'displayName email avatar isOnline')
        .populate('createdBy', 'displayName email avatar')
        .sort({ updatedAt: -1 });
      
      reply.send({ rooms });
    } catch (error) {
      reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get room by ID
  fastify.get('/rooms/:roomId', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { roomId } = request.params as { roomId: string };
      const userId = (request as any).user.userId;
      
      const room = await ChatRoom.findOne({ _id: roomId, participants: userId })
        .populate('participants', 'displayName email avatar isOnline')
        .populate('createdBy', 'displayName email avatar');
      
      if (!room) {
        return reply.status(404).send({ error: 'Room not found or access denied' });
      }
      
      reply.send({ room });
    } catch (error) {
      reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Update room
  fastify.put('/rooms/:roomId', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { roomId } = request.params as { roomId: string };
      const { name, description } = updateRoomSchema.parse(request.body);
      const userId = (request as any).user.userId;
      
      const room = await ChatRoom.findOne({ _id: roomId, participants: userId });
      if (!room) {
        return reply.status(404).send({ error: 'Room not found or access denied' });
      }
      
      // Only creator can update group rooms
      if (room.type === 'group' && room.createdBy.toString() !== userId) {
        return reply.status(403).send({ error: 'Only room creator can update group rooms' });
      }
      
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      
      const updatedRoom = await ChatRoom.findByIdAndUpdate(
        roomId,
        updateData,
        { new: true, runValidators: true }
      ).populate('participants', 'displayName email avatar isOnline')
       .populate('createdBy', 'displayName email avatar');
      
      reply.send({ message: 'Room updated successfully', room: updatedRoom });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Delete room
  fastify.delete('/rooms/:roomId', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { roomId } = request.params as { roomId: string };
      const userId = (request as any).user.userId;
      
      const room = await ChatRoom.findOne({ _id: roomId, participants: userId });
      if (!room) {
        return reply.status(404).send({ error: 'Room not found or access denied' });
      }
      
      // Only creator can delete group rooms, anyone can leave personal rooms
      if (room.type === 'group' && room.createdBy.toString() !== userId) {
        return reply.status(403).send({ error: 'Only room creator can delete group rooms' });
      }
      
      // Delete all messages in the room
      await Message.deleteMany({ roomId });
      
      // Delete the room
      await ChatRoom.findByIdAndDelete(roomId);
      
      reply.send({ message: 'Room deleted successfully' });
    } catch (error) {
      reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get room messages with pagination
  fastify.get('/rooms/:roomId/messages', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { roomId } = request.params as { roomId: string };
      const { page, limit } = paginationSchema.parse(request.query);
      const userId = (request as any).user.userId;
      
      // Check if user has access to the room
      const room = await ChatRoom.findOne({ _id: roomId, participants: userId });
      if (!room) {
        return reply.status(404).send({ error: 'Room not found or access denied' });
      }
      
      const skip = (page - 1) * limit;
      
      const messages = await Message.find({ roomId })
        .populate('sender', 'displayName email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const totalMessages = await Message.countDocuments({ roomId });
      
      reply.send({
        messages: messages.reverse(), // Reverse to show oldest first
        pagination: {
          page,
          limit,
          total: totalMessages,
          pages: Math.ceil(totalMessages / limit)
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get all users for personal chat
  fastify.get('/users', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      
      const users = await User.find({ _id: { $ne: userId } })
        .select('displayName email avatar isOnline lastSeen')
        .sort({ displayName: 1 });
      
      // Transform _id to id for frontend compatibility
      const transformedUsers = users.map(user => ({
        id: (user._id as any).toString(),
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }));
      
      reply.send({ users: transformedUsers });
    } catch (error) {
      reply.status(500).send({ error: 'Internal server error' });
    }
  });
}
