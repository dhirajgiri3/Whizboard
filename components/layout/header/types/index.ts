import { LucideIcon } from 'lucide-react';

export interface NavigationItem {
  href: string;
  label: string;
  description?: string;
  color: {
    bg: string;
    text: string;
    hover: {
      bg: string;
      text: string;
    };
  };
}

export interface UserMenuItem {
  href?: string;
  label: string;
  icon: LucideIcon;
  description: string;
  color: {
    bg: string;
    text: string;
    hover: {
      bg: string;
      text: string;
    };
  };
  action?: () => void;
}

export interface MenuItem {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export interface HeaderTheme {
  isLightMode: boolean;
}

export interface HeaderProps {
  className?: string;
} 