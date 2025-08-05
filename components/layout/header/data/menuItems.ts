import {
  User,
  Settings,
  LogOut,
  Users,
  Info,
  HelpCircle,
  MessageSquare,
  FileText,
  Shield,
} from 'lucide-react';
import { NavigationItem, UserMenuItem, MenuItem } from '../types';

export const navigationItems: NavigationItem[] = [
  {
    href: '/',
    label: 'Home',
    color: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      hover: { bg: 'hover:bg-blue-200', text: 'hover:text-blue-700' },
    },
  },
  {
    href: '/my-boards',
    label: 'My Boards',
    color: {
      bg: 'bg-indigo-100',
      text: 'text-indigo-600',
      hover: { bg: 'hover:bg-indigo-200', text: 'hover:text-indigo-700' },
    },
  },
];

export const companyMenuItems: MenuItem[] = [
  {
    href: '/about',
    label: 'About Us',
    description: 'Learn about our mission and team',
    icon: Info,
  },
  {
    href: '/contact',
    label: 'Contact',
    description: 'Get in touch with our team',
    icon: MessageSquare,
  },
];

export const supportMenuItems: MenuItem[] = [
  {
    href: '/help',
    label: 'Help Center',
    description: 'Get help and support',
    icon: HelpCircle,
  },
  {
    href: '/privacy',
    label: 'Privacy Policy',
    description: 'Learn about data protection',
    icon: Shield,
  },
  {
    href: '/terms',
    label: 'Terms of Service',
    description: 'Read our terms and conditions',
    icon: FileText,
  },
];

export const userMenuItems: UserMenuItem[] = [
  {
    href: '/profile',
    label: 'My Profile',
    icon: User,
    description: 'Manage your account',
    color: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      hover: { bg: 'hover:bg-blue-200', text: 'hover:text-blue-700' },
    },
  },
  {
    href: '/team-workspace',
    label: 'Team & Workspace',
    icon: Users,
    description: 'Manage your team and workspace',
    color: {
      bg: 'bg-teal-100',
      text: 'text-teal-600',
      hover: { bg: 'hover:bg-teal-200', text: 'hover:text-teal-700' },
    },
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
    description: 'Preferences & privacy',
    color: {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      hover: { bg: 'hover:bg-gray-200', text: 'hover:text-gray-900' },
    },
  },
  {
    label: 'Sign Out',
    icon: LogOut,
    description: 'End your session',
    color: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      hover: { bg: 'hover:bg-red-200', text: 'hover:text-red-700' },
    },
    action: () => {}, // Will be set dynamically
  },
]; 