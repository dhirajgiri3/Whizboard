import { 
  BookOpen, 
  Zap, 
  Users, 
  HelpCircle, 
  Clock, 
  Play, 
  Keyboard, 
  Star, 
  MessageCircle, 
  Mail 
} from "lucide-react";
import { HelpCategory, QuickStartGuide, SupportOption } from "../types";

export const helpCategories: HelpCategory[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Learn the basics of WhizBoard and create your first board",
    icon: BookOpen,
    color: "from-blue-500 to-indigo-600",
    articles: [
      {
        id: "create-first-board",
        title: "Create Your First Board",
        description: "Step-by-step guide to creating and setting up your first collaborative whiteboard",
        difficulty: "beginner",
        timeToRead: "5 min",
        tags: ["setup", "basics", "first-time"],
        featured: true
      },
      {
        id: "invite-collaborators",
        title: "Invite Team Members",
        description: "Learn how to invite colleagues and start collaborating in real-time",
        difficulty: "beginner",
        timeToRead: "3 min",
        tags: ["collaboration", "invite", "team"]
      },
      {
        id: "basic-tools",
        title: "Using Basic Tools",
        description: "Master the essential drawing, text, and shape tools",
        difficulty: "beginner",
        timeToRead: "8 min",
        tags: ["tools", "drawing", "text", "shapes"]
      }
    ]
  },
  {
    id: "advanced-features",
    title: "Advanced Features",
    description: "Unlock the full potential of WhizBoard with advanced tools",
    icon: Zap,
    color: "from-blue-600 to-blue-700",
    articles: [
      {
        id: "frames-and-layers",
        title: "Frames and Layer Management",
        description: "Organize your work with frames and master layer management",
        difficulty: "intermediate",
        timeToRead: "12 min",
        tags: ["frames", "layers", "organization"]
      },
      {
        id: "templates",
        title: "Using Templates",
        description: "Save time with pre-built templates and create your own",
        difficulty: "intermediate",
        timeToRead: "6 min",
        tags: ["templates", "productivity", "workflow"]
      },
      {
        id: "integrations",
        title: "Third-party Integrations",
        description: "Connect WhizBoard with your favorite tools and services",
        difficulty: "advanced",
        timeToRead: "10 min",
        tags: ["integrations", "api", "automation"]
      }
    ]
  },
  {
    id: "collaboration",
    title: "Collaboration",
    description: "Work together effectively with real-time collaboration features",
    icon: Users,
    color: "from-emerald-500 to-green-600",
    articles: [
      {
        id: "real-time-sync",
        title: "Real-time Synchronization",
        description: "Understand how real-time collaboration works and best practices",
        difficulty: "beginner",
        timeToRead: "7 min",
        tags: ["sync", "real-time", "collaboration"]
      },
      {
        id: "permissions",
        title: "Managing Permissions",
        description: "Control who can view, edit, or manage your boards",
        difficulty: "intermediate",
        timeToRead: "5 min",
        tags: ["permissions", "security", "access"]
      },
      {
        id: "comments-feedback",
        title: "Comments and Feedback",
        description: "Use comments to provide feedback and track changes",
        difficulty: "intermediate",
        timeToRead: "4 min",
        tags: ["comments", "feedback", "review"]
      }
    ]
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    description: "Solve common issues and get back to creating",
    icon: HelpCircle,
    color: "from-amber-500 to-orange-600",
    articles: [
      {
        id: "connection-issues",
        title: "Connection Problems",
        description: "Fix connectivity issues and sync problems",
        difficulty: "beginner",
        timeToRead: "6 min",
        tags: ["connection", "sync", "troubleshooting"]
      },
      {
        id: "performance-optimization",
        title: "Performance Optimization",
        description: "Tips to improve WhizBoard performance on your device",
        difficulty: "intermediate",
        timeToRead: "8 min",
        tags: ["performance", "optimization", "speed"]
      },
      {
        id: "data-recovery",
        title: "Data Recovery",
        description: "Recover lost work and restore previous versions",
        difficulty: "intermediate",
        timeToRead: "5 min",
        tags: ["recovery", "backup", "version-control"]
      }
    ]
  }
];

export const quickStartGuides: QuickStartGuide[] = [
  {
    title: "5-Minute Setup",
    description: "Get up and running in just 5 minutes",
    icon: Clock,
    href: "#",
    color: "from-blue-500 to-indigo-600"
  },
  {
    title: "Video Tutorials",
    description: "Watch step-by-step video guides",
    icon: Play,
    href: "#",
    color: "from-blue-600 to-blue-700"
  },
  {
    title: "Keyboard Shortcuts",
    description: "Master productivity with keyboard shortcuts",
    icon: Keyboard,
    href: "#",
    color: "from-emerald-500 to-green-600"
  },
  {
    title: "Best Practices",
    description: "Learn from the pros with expert tips",
    icon: Star,
    href: "#",
    color: "from-amber-500 to-orange-600"
  }
];

export const supportOptions: SupportOption[] = [
  {
    title: "Live Chat",
    description: "Get instant help from our support team",
    icon: MessageCircle,
    href: "/contact",
    cta: "Start Chat",
    color: "from-blue-500 to-indigo-600"
  },
  {
    title: "Email Support",
    description: "Send us a detailed message",
    icon: Mail,
    href: "mailto:support@whizboard.com",
    cta: "Send Email",
    color: "from-emerald-500 to-green-600"
  },
  {
    title: "Request Feature",
    description: "Suggest new features or improvements",
    icon: HelpCircle,
    href: "/contact",
    cta: "Submit Request",
    color: "from-amber-500 to-orange-600"
  }
]; 