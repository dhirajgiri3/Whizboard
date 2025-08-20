# 🎨 WhizBoard - Real-Time Collaborative Whiteboard Platform

<div align="center">

![WhizBoard Logo](public/images/logos/whizboard_logo.png)

**A modern, enterprise-grade collaborative whiteboard application built for teams, educators, and creative professionals.**

[![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.9.2-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-black?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

[🚀 Live Demo](#) • [📖 Documentation](#) • [💬 Discord](#) • [🐛 Report Bug](#)

</div>

---

## ✨ What is WhizBoard?

WhizBoard is a cutting-edge collaborative whiteboard platform that transforms how teams brainstorm, design, and collaborate in real-time. Built with modern web technologies, it provides a seamless drawing experience with advanced collaboration features, making it perfect for remote teams, educators, designers, and anyone who needs to visualize ideas together.

### 🎯 **Key Value Propositions**
- **Real-time collaboration** with live cursor tracking and instant sync
- **Professional drawing tools** with pressure sensitivity and customization
- **Advanced canvas management** with infinite zoom and layer organization
- **Cross-platform accessibility** - works on any device with a browser
- **Enterprise-grade security** with role-based permissions and audit logging

---

## 🚀 Features

### 🎨 **Drawing & Design Tools**
- **Professional Pen Tools**
  - Pressure-sensitive drawing with customizable brush sizes
  - Multiple pen types (pen, highlighter, marker)
  - Smooth line rendering with anti-aliasing
  - Customizable stroke widths and colors

- **Shape Creation**
  - Geometric shapes (circles, rectangles, triangles, stars)
  - Perfect shapes with Shift key constraint
  - Customizable fill colors and stroke styles
  - Smart snapping and alignment guides

- **Text & Typography**
  - Rich text editing with multiple fonts
  - Text formatting (size, color, alignment)
  - Real-time text collaboration
  - Auto-save and version history

- **Sticky Notes & Annotations**
  - Color-coded sticky notes for organization
  - Rich text support with markdown
  - Real-time collaborative editing
  - Search and filter capabilities

### 🔄 **Real-Time Collaboration**
- **Live User Presence**
  - Real-time cursor tracking with user identification
  - User avatars and status indicators
  - Activity monitoring and presence history
  - Connection quality indicators

- **Instant Synchronization**
  - WebSocket-based real-time updates
  - Server-Sent Events for notifications
  - Conflict-free editing with operational transformation
  - Offline support with sync on reconnect

- **Collaborative Features**
  - Multi-user drawing in real-time
  - Live comments and annotations
  - User permissions and access control
  - Session management and moderation

### 🖼️ **Advanced Canvas Management**
- **Infinite Canvas**
  - Unlimited zoom (0.1x to 1000x)
  - Smooth panning and navigation
  - Grid system with snap-to-grid
  - Mini-map for large board navigation

- **Layer Management**
  - Multiple layer support with organization
  - Layer visibility and locking
  - Group and ungroup elements
  - Layer-based permissions

- **Frame & Organization**
  - Frame creation for content organization
  - Auto-layout and alignment tools
  - Presentation mode for client meetings
  - Export to various formats (PDF, PNG, SVG)

### 🔐 **Security & Compliance**
- **Authentication & Authorization**
  - NextAuth.js integration with multiple providers
  - Google OAuth 2.0 and custom authentication
  - Role-based access control
  - Session management and security

- **Data Protection**
  - End-to-end encryption for sensitive data
  - GDPR compliance features
  - Data retention policies
  - Audit logging for all actions

- **Enterprise Features**
  - SSO integration capabilities
  - Advanced user management
  - Compliance reporting
  - Backup and disaster recovery

### 📱 **Cross-Platform Experience**
- **Responsive Design**
  - Mobile-optimized touch interface
  - Tablet-specific gestures and controls
  - Desktop keyboard shortcuts
  - Adaptive UI based on device capabilities

- **Browser Compatibility**
  - Modern browser support (Chrome, Firefox, Safari, Edge)
  - Progressive Web App capabilities
  - Offline functionality
  - Cross-browser synchronization

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: Next.js 15.3.4 with App Router
- **UI Library**: React 19.1.0 with TypeScript 5.8.3
- **Styling**: Tailwind CSS 4.0 with custom design system
- **Animations**: Framer Motion 12.23.9
- **Canvas**: Konva.js 9.3.20 with React-Konva
- **State Management**: React Hooks with Context API

### **Backend & APIs**
- **Runtime**: Node.js 18+ with Express middleware
- **GraphQL**: Apollo Client 3.13.8 with GraphQL Yoga
- **Real-time**: WebSockets (ws 8.18.3) + Server-Sent Events
- **Authentication**: NextAuth.js 4.24.11
- **Validation**: Zod 3.23.8 for schema validation

### **Database & Storage**
- **Primary Database**: MongoDB 5.9.2 with Mongoose
- **Caching**: Redis with Upstash
- **File Storage**: Cloudinary for image management
- **Session Storage**: MongoDB adapter for NextAuth

### **DevOps & Tools**
- **Testing**: Vitest 3.2.4 with Testing Library
- **Linting**: ESLint 9 with Next.js config
- **Logging**: Pino 9.7.0 with pretty formatting
- **Security**: Snyk for vulnerability scanning
- **Deployment**: Vercel-ready configuration

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18.0.0 or higher
- MongoDB 5.0+ (local or Atlas)
- Redis instance (optional, for enhanced performance)
- Git

### **Installation**

```bash
# Clone the repository
git clone https://github.com/your-username/whizboard.git
cd whizboard

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Configure your environment variables (see below)
nano .env.local

# Run database migrations (if applicable)
npm run migrate:users

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### **Environment Variables**

Create a `.env.local` file with the following variables:

```bash
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/whizboard
REDIS_URL=redis://localhost:6379

# Authentication
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# File Storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Services
SENDGRID_API_KEY=your-sendgrid-key
FROM_EMAIL=noreply@yourdomain.com

# Security
CSRF_SECRET=your-csrf-secret
ENCRYPTION_KEY=your-encryption-key

# Optional: Slack Integration
SLACK_CLIENT_ID=your-slack-client-id
SLACK_CLIENT_SECRET=your-slack-client-secret
SLACK_SIGNING_SECRET=your-slack-signing-secret
```

---

## 📁 Project Structure

```
whizboard/
├── 📁 app/                          # Next.js App Router
│   ├── 📁 api/                      # API Routes & Endpoints
│   │   ├── 📁 auth/                 # Authentication APIs
│   │   ├── 📁 board/                # Whiteboard APIs
│   │   ├── 📁 graphql/              # GraphQL endpoint
│   │   ├── 📁 integrations/         # Third-party integrations
│   │   └── 📁 workspace/            # Workspace management
│   ├── 📁 board/[id]/               # Dynamic board pages
│   ├── 📁 profile/                  # User profile pages
│   ├── 📁 settings/                 # User settings
│   └── 📁 workspace/                # Team workspace
├── 📁 components/                    # React Components
│   ├── 📁 canvas/                   # Canvas & drawing components
│   ├── 📁 layout/                   # Layout & navigation
│   ├── 📁 reatime/                  # Real-time collaboration
│   ├── 📁 toolbar/                  # Drawing toolbars
│   └── 📁 ui/                       # Reusable UI components
├── 📁 hooks/                        # Custom React Hooks
├── 📁 lib/                          # Utility libraries
│   ├── 📁 apollo/                   # GraphQL client
│   ├── 📁 auth/                     # Authentication utilities
│   ├── 📁 database/                 # Database connections
│   ├── 📁 integrations/             # Third-party services
│   └── 📁 utils/                    # Helper functions
├── 📁 types/                        # TypeScript definitions
├── 📁 public/                       # Static assets
└── 📁 docs/                         # Documentation
```

---

## 🔧 Development

### **Available Scripts**

```bash
# Development
npm run dev              # Start development server with logging
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Testing
npm run test             # Run tests with Vitest
npm run test:ui          # Run tests with UI
npm run test:run         # Run tests once

# Security
npm run security:audit   # Run security audit
npm run security:check   # Check for vulnerabilities
npm run security:monitor # Monitor with Snyk

# Database
npm run migrate:users    # Run user migrations
npm run migrate:users:dry-run  # Test migrations
npm run migrate:users:force    # Force migration
```

### **Development Guidelines**

- **Code Style**: Follow the existing ESLint configuration
- **TypeScript**: Use strict typing for all new code
- **Components**: Create reusable, composable components
- **Testing**: Write tests for new features and bug fixes
- **Performance**: Optimize for large boards and many users

### **Debugging**

The development server includes enhanced logging with Pino:

```bash
npm run dev  # Includes pino-pretty for readable logs
```

Check the console for detailed request/response logs and error information.

---

## 🧪 Testing

WhizBoard uses Vitest for testing with comprehensive coverage:

```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests once
npm run test:run
```

### **Test Structure**
- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API endpoint and database testing
- **E2E Tests**: User workflow testing (planned)

---

## 🚀 Deployment

### **Vercel (Recommended)**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### **Environment Setup**
1. Set all required environment variables in Vercel
2. Configure MongoDB Atlas connection
3. Set up custom domains if needed
4. Configure SSL certificates

### **Performance Optimization**
- Enable Vercel Edge Functions for real-time features
- Use CDN for static assets
- Implement proper caching strategies
- Monitor Core Web Vitals

---

## 🔌 Integrations

### **Google Drive**
- File import/export
- Real-time collaboration
- OAuth 2.0 authentication
- Folder synchronization

### **Slack**
- Team notifications
- Command integration
- Channel management
- Real-time updates

### **Custom Integrations**
- REST API endpoints
- Webhook support
- GraphQL subscriptions
- Plugin architecture

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### **Getting Started**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following our coding standards
4. Add tests for new functionality
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### **Contribution Areas**
- 🐛 Bug fixes and improvements
- ✨ New features and enhancements
- 📚 Documentation updates
- 🧪 Test coverage improvements
- 🎨 UI/UX enhancements
- 🔧 Performance optimizations

### **Code Standards**
- Follow TypeScript best practices
- Use meaningful commit messages
- Include tests for new features
- Update documentation as needed
- Follow the existing code style

---

## 📚 Documentation

- [📖 Complete Documentation](./docs/README.md)
- [🔔 Real-Time Features Guide](./docs/REALTIME_NOTIFICATIONS_TESTING.md)
- [🔧 Integration Guides](./docs/SLACK_TROUBLESHOOTING.md)
- [🎨 Design System](./Designinstructions.md)
- [🗺️ Implementation Roadmap](./WhizBoard_Implementation_Roadmap.md)

---

## 🆘 Support & Community

### **Getting Help**
- 📧 Email: Hello@cyperstudio.in
- 🐛 Issues: [GitHub Issues](#)
- 💬 Discussions: [GitHub Discussions](#)
- 📖 Documentation: [Full Docs](#)

### **Community Guidelines**
- Be respectful and inclusive
- Help others learn and grow
- Share knowledge and experiences
- Report bugs and suggest improvements

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **Konva.js** for the powerful canvas library
- **Tailwind CSS** for the utility-first CSS framework
- **Our Contributors** for making WhizBoard better every day

---

<div align="center">

**Made with ❤️ by the WhizBoard Team**

[![GitHub stars](https://img.shields.io/github/stars/your-username/whizboard?style=social)](https://github.com/your-username/whizboard)
[![GitHub forks](https://img.shields.io/github/forks/your-username/whizboard?style=social)](https://github.com/your-username/whizboard)
[![GitHub issues](https://img.shields.io/github/issues/your-username/whizboard)](https://github.com/your-username/whizboard)

</div>
