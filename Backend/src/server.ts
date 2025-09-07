import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { createServer } from 'http';
import connectDB from './config/database';
import authRoutes from './routes/auth';
import roomRoutes from './routes/rooms';
import SocketHandler from './socket/socketHandler';
import { authenticate } from './middleware/auth';

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'info'
  }
});

// Register plugins
fastify.register(cors, {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
});

// Add authentication decorator
fastify.decorate('authenticate', authenticate);

// Register routes
fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(roomRoutes, { prefix: '/api' });

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  return { status: 'OK', timestamp: new Date().toISOString() };
});

// Create HTTP server
const server = createServer();

// Initialize Socket.IO first
const socketHandler = new SocketHandler(server);

// Attach Fastify to the HTTP server
fastify.ready().then(() => {
  // Handle HTTP requests with Fastify
  server.on('request', (req, res) => {
    // Skip Socket.IO requests
    if (req.url?.startsWith('/socket.io/')) {
      return;
    }
    fastify.server.emit('request', req, res);
  });
  
  // Handle WebSocket upgrades with Socket.IO
  server.on('upgrade', (req, socket, head) => {
    if (req.url?.startsWith('/socket.io/')) {
      // Let Socket.IO handle WebSocket upgrades
      return;
    }
    // Handle other upgrades with Fastify if needed
    fastify.server.emit('upgrade', req, socket, head);
  });
});

// Attach Socket.IO to Fastify
fastify.decorate('io', socketHandler.getSocket());

// Start server
const start = async () => {
  try {
    // Connect to database
    await connectDB();
    
    const port = process.env.PORT || 3001;
    const host = process.env.HOST || '0.0.0.0';
    
    // Start the HTTP server directly
    server.listen(Number(port), host, () => {
      console.log(`🚀 Server running on http://${host}:${port}`);
      console.log(`📡 Socket.IO server ready for connections`);
      console.log(`🔗 CORS enabled for: ${process.env.CORS_ORIGIN || "http://localhost:3000"}`);
    });
    
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await fastify.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await fastify.close();
  process.exit(0);
});

start();
