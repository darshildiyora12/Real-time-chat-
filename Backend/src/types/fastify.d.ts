import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: typeof authenticate;
  }
}
