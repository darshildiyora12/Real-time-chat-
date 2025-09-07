import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import User from '../models/User';
import { generateToken } from '../middleware/auth';

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(50, 'Display name cannot exceed 50 characters'),
  avatar: z.string().url('Invalid avatar URL').optional().or(z.literal(''))
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

const updateProfileSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(50, 'Display name cannot exceed 50 characters').optional(),
  avatar: z.string().url('Invalid avatar URL').optional()
});

export default async function authRoutes(fastify: FastifyInstance) {
  // Register
  fastify.post('/register', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { email, password, displayName, avatar } = registerSchema.parse(request.body);
      
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return reply.status(400).send({ error: 'User already exists with this email' });
      }
      
      // Create new user
      const user = new User({
        email,
        password,
        displayName,
        avatar: avatar || undefined
      });
      
      await user.save();
      
      // Generate JWT token
      const token = generateToken((user._id as any).toString(), user.email);
      
      reply.status(201).send({
        message: 'User created successfully',
        token,
        user: {
          id: (user._id as any),
          email: user.email,
          displayName: user.displayName,
          avatar: user.avatar,
          isOnline: user.isOnline
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Login
  fastify.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { email, password } = loginSchema.parse(request.body);
      
      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }
      
      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }
      
      // Update online status
      user.isOnline = true;
      user.lastSeen = new Date();
      await user.save();
      
      // Generate JWT token
      const token = generateToken((user._id as any).toString(), user.email);
      
      reply.send({
        message: 'Login successful',
        token,
        user: {
          id: (user._id as any),
          email: user.email,
          displayName: user.displayName,
          avatar: user.avatar,
          isOnline: user.isOnline
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get current user profile
  fastify.get('/profile', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = await User.findById((request as any).user.userId).select('-password');
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }
      
      reply.send({ user });
    } catch (error) {
      reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Update user profile
  fastify.put('/profile', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { displayName, avatar } = updateProfileSchema.parse(request.body);
      const userId = (request as any).user.userId;
      
      const updateData: any = {};
      if (displayName !== undefined) updateData.displayName = displayName;
      if (avatar !== undefined) updateData.avatar = avatar;
      
      const user = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');
      
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }
      
      reply.send({ message: 'Profile updated successfully', user });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // Logout
  fastify.post('/logout', { preHandler: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const userId = (request as any).user.userId;
      
      // Update online status
      await User.findByIdAndUpdate(userId, { 
        isOnline: false, 
        lastSeen: new Date() 
      });
      
      reply.send({ message: 'Logout successful' });
    } catch (error) {
      reply.status(500).send({ error: 'Internal server error' });
    }
  });
}
