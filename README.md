# Nextbase Chat - Real-Time Group Chat Application

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)

A modern, full-stack real-time group chat application built with Next.js, Node.js, Fastify, MongoDB, and Socket.IO.

## 📸 Screenshots

![Chat Interface](https://via.placeholder.com/800x400/1f2937/ffffff?text=Chat+Interface)
![Mobile View](https://via.placeholder.com/400x600/1f2937/ffffff?text=Mobile+View)

## 🚀 Features

### Core Features
- **User Authentication**: Email/password signup and login with JWT tokens
- **Real-Time Messaging**: Bi-directional WebSocket communication using Socket.IO
- **Group Chats**: Create, rename, and delete group chat rooms
- **Personal Chats**: One-on-one conversations with other users
- **Message History**: Persistent message storage with pagination
- **Online Presence**: Real-time online/offline status indicators
- **Typing Indicators**: See when others are typing
- **Interactive UI**: Clickable buttons for participants and room options
- **Modal Components**: User-friendly modals for better UX
- **Responsive Design**: Modern, mobile-friendly UI

### Technical Features
- **TypeScript**: Full type safety across frontend and backend
- **Modern UI**: Built with Tailwind CSS and Lucide React icons
- **State Management**: Zustand for client-side state management
- **Form Validation**: Zod schema validation
- **Real-time Updates**: Socket.IO for instant messaging
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication
- **API**: RESTful API with Fastify

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Fastify** - Fast and low overhead web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Socket.IO** - Real-time bidirectional communication
- **TypeScript** - Type-safe JavaScript
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Zod** - Schema validation

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - State management
- **React Hook Form** - Form handling
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **React Hot Toast** - Toast notifications

## 📁 Project Structure

```
nextbase-chat/
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── ChatRoom.ts
│   │   │   └── Message.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   └── rooms.ts
│   │   ├── socket/
│   │   │   └── socketHandler.ts
│   │   ├── types/
│   │   │   ├── index.ts
│   │   │   └── fastify.d.ts
│   │   └── server.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── .gitignore
│   └── env.example
├── Frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── register/
│   │   │   │       └── page.tsx
│   │   │   ├── chat/
│   │   │   │   └── page.tsx
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── ChatArea.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   ├── CreateRoomModal.tsx
│   │   │   ├── ProfileModal.tsx
│   │   │   └── ProfileSection.tsx
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   ├── socket.ts
│   │   │   └── utils.ts
│   │   ├── store/
│   │   │   ├── authStore.ts
│   │   │   └── chatStore.ts
│   │   └── types/
│   │       └── index.ts
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── .gitignore
│   └── env.local.example
├── .gitignore
├── README.md
└── SETUP.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nextbase-chat.git
   cd nextbase-chat
   ```

2. **Install Backend Dependencies**
   ```bash
   cd Backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../Frontend
   npm install
   ```

4. **Environment Setup**

   **Backend Environment:**
   ```bash
   cd Backend
   cp env.example .env
   ```
   
   Edit `.env` file:
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
   
   Edit `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
   ```

### Running the Application

1. **Start MongoDB**
   ```bash
   mongod
   ```

2. **Start Backend Server**
   ```bash
   cd Backend
   npm run dev
   ```
   Backend will run on http://localhost:3001

3. **Start Frontend Development Server**
   ```bash
   cd Frontend
   npm run dev
   ```
   Frontend will run on http://localhost:3000

4. **Open the Application**
   Navigate to http://localhost:3000 in your browser

## 📱 Usage

### Authentication
1. **Register**: Create a new account with email, password, and display name
2. **Login**: Sign in with your credentials
3. **Profile**: Update your display name and avatar

### Chat Features
1. **Group Chats**: Create group rooms and invite multiple users
2. **Personal Chats**: Start one-on-one conversations with other users
3. **Real-time Messaging**: Send and receive messages instantly
4. **Message History**: View previous messages with pagination
5. **Online Status**: See who's online in real-time
6. **Typing Indicators**: Know when someone is typing

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - User logout

### Rooms
- `GET /api/rooms` - Get user's rooms
- `POST /api/rooms` - Create new room
- `GET /api/rooms/:id` - Get room details
- `PUT /api/rooms/:id` - Update room
- `DELETE /api/rooms/:id` - Delete room
- `GET /api/rooms/:id/messages` - Get room messages
- `GET /api/users` - Get all users

### Socket Events
- `join_room` - Join a chat room
- `leave_room` - Leave a chat room
- `send_message` - Send a message
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator

## 🎨 UI Components

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern Interface**: Clean, intuitive design
- **Real-time Updates**: Instant message delivery and status updates
- **Accessibility**: Keyboard navigation and screen reader support
- **Dark Mode Ready**: Easy to extend with dark theme

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Zod schema validation
- **CORS Protection**: Configured CORS policies
- **Rate Limiting**: Built-in Fastify rate limiting

## 🚀 Deployment

### Backend Deployment
1. Build the application: `npm run build`
2. Start production server: `npm start`
3. Set environment variables for production

### Frontend Deployment
1. Build the application: `npm run build`
2. Start production server: `npm start`
3. Configure environment variables

### Database
- Ensure MongoDB is running and accessible
- Set up proper database authentication
- Configure connection strings for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

## 🔮 Future Enhancements

- File sharing capabilities
- Message reactions and emojis
- Voice and video calling
- Message search functionality
- Push notifications
- Mobile app development
- Advanced admin features
- Message encryption
- Custom themes
- Bot integration

## 📊 GitHub Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/nextbase-chat?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/nextbase-chat?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/nextbase-chat)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/nextbase-chat)

## 🎯 Quick Start

```bash
# Clone and setup
git clone https://github.com/yourusername/nextbase-chat.git
cd nextbase-chat

# Install dependencies
cd Backend && npm install
cd ../Frontend && npm install

# Setup environment
cp Backend/env.example Backend/.env
cp Frontend/env.local.example Frontend/.env.local

# Start development servers
# Terminal 1: Backend
cd Backend && npm run dev

# Terminal 2: Frontend  
cd Frontend && npm run dev
```

## 📝 Recent Updates

- ✅ **Interactive UI**: Added clickable buttons for participants and room options
- ✅ **Modal Components**: Implemented user-friendly modals for better UX
- ✅ **TypeScript Fixes**: Resolved all TypeScript compilation errors
- ✅ **Build Optimization**: Both frontend and backend build successfully
- ✅ **GitHub Ready**: Added proper .gitignore files and documentation

---

**Built with ❤️ by the Nextbase Team**

⭐ **Star this repository if you found it helpful!**
#   R e a l - t i m e - c h a t -  
 #   R e a l - t i m e - c h a t -  
 #   R e a l - t i m e - c h a t -  
 #   R e a l - t i m e - c h a t -  
 