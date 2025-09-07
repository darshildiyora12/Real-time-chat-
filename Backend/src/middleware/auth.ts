import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return reply.status(401).send({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-here') as { userId: string; email: string };
    (request as any).user = decoded;
  } catch (err) {
    reply.status(401).send({ error: 'Invalid token' });
  }
};

export const generateToken = (userId: string, email: string): string => {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET || 'your-super-secret-jwt-key-here', { expiresIn: '7d' });
};

export const verifyToken = async (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-here');
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
};
