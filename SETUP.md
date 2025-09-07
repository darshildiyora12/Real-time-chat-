# Nextbase Chat - Setup Guide

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### 1. Install Dependencies

**Backend:**
```bash
cd Backend
npm install
```

**Frontend:**
```bash
cd Frontend
npm install
```

### 2. Environment Setup

**Backend Environment:**
```bash
cd Backend
cp env.example .env
```

Edit `Backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/nextbase-chat
JWT_SECRET=your-super-secret-jwt-key-here
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

**Frontend Environment:**
```bash
cd Frontend
cp env.local.example .env.local
```

Edit `Frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### 3. Start the Application

**Terminal 1 - Start MongoDB:**
```bash
mongod
```

**Terminal 2 - Start Backend:**
```bash
cd Backend
npm run dev
```

**Terminal 3 - Start Frontend:**
```bash
cd Frontend
npm run dev
```

### 4. Access the Application

Open your browser and go to: http://localhost:3000

## Features Available

✅ **User Authentication**
- Register new account
- Login with email/password
- Update profile (display name, avatar)

✅ **Real-time Messaging**
- Send and receive messages instantly
- Typing indicators
- Online/offline presence

✅ **Group Chats**
- Create group rooms
- Invite multiple users
- Rename and delete rooms

✅ **Personal Chats**
- One-on-one conversations
- Start chats with any user

✅ **Message History**
- Persistent message storage
- Pagination for older messages

## Troubleshooting

### Backend Issues
- Make sure MongoDB is running
- Check if port 3001 is available
- Verify environment variables are set correctly

### Frontend Issues
- Make sure backend is running on port 3001
- Check browser console for errors
- Verify environment variables are set correctly

### Common Errors
1. **MongoDB connection failed**: Start MongoDB service
2. **Port already in use**: Change PORT in .env file
3. **CORS errors**: Check CORS_ORIGIN in backend .env
4. **JWT errors**: Verify JWT_SECRET is set

## Development

### Backend Development
```bash
cd Backend
npm run dev  # Starts with hot reload
npm run build  # Builds for production
npm start  # Runs production build
```

### Frontend Development
```bash
cd Frontend
npm run dev  # Starts development server
npm run build  # Builds for production
npm start  # Runs production build
```

## Project Structure

```
Nextbase/
├── Backend/          # Node.js + Fastify + MongoDB
├── Frontend/         # Next.js + React + TypeScript
└── README.md         # Full documentation
```

## Support

If you encounter any issues:
1. Check the console logs
2. Verify all dependencies are installed
3. Ensure MongoDB is running
4. Check environment variables
5. Review the full README.md for detailed documentation

Happy coding! 🚀
