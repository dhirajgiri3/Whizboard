# 🎨 WhizBoard - Real-Time Collaborative Whiteboard

A modern, real-time collaborative whiteboard application built with Next.js, featuring live drawing, user presence, and seamless collaboration.

## ✨ Features

### 🎯 **Core Features**
- **Real-time collaborative drawing** with live cursor tracking
- **Multiple drawing tools** (pen, shapes, text, sticky notes)
- **User presence indicators** showing who's online
- **Live notifications** for follows and messages
- **Public profiles** with social features
- **Board sharing** and collaboration

### 🔔 **Real-Time Features**
- **Server-Sent Events** for live notifications
- **WebSocket connections** for real-time collaboration
- **Live cursor tracking** with user identification
- **Instant updates** across all connected users
- **Connection status monitoring**

### 👥 **Social Features**
- **Public profiles** with customizable usernames
- **Follow/unfollow system** with notifications
- **User discovery** through public profiles
- **Profile analytics** and statistics
- **Real-time following notifications**

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+
- MongoDB
- Next.js 14+

### **Installation**
```bash
# Clone the repository
git clone <repository-url>
cd whizboard

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Configure your environment variables

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
whizboard/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── board/             # Board pages
│   ├── profile/           # Profile pages
│   └── settings/          # Settings pages
├── components/            # React components
│   ├── layout/           # Layout components
│   ├── ui/               # UI components
│   └── canvas/           # Canvas components
├── lib/                  # Utility libraries
├── hooks/                # Custom React hooks
├── types/                # TypeScript definitions
└── docs/                 # Documentation
```

## 🔧 Development

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests
```

### **Environment Variables**
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/cyperboard

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 📚 Documentation

- [📖 Complete Documentation](./docs/README.md)
- [🔔 Real-Time Notifications Testing](./docs/REALTIME_NOTIFICATIONS_TESTING.md)
- [🔧 Slack Integration Troubleshooting](./docs/SLACK_TROUBLESHOOTING.md)

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Real-time**: Server-Sent Events, WebSockets
- **Canvas**: Konva.js for drawing functionality
- **Deployment**: Vercel

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email Hello@cyperstudio.in or create an issue in the repository.
