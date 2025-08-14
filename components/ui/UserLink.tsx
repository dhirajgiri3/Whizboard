"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface UserLinkProps {
  user: {
    id?: string;
    name: string;
    email: string;
    username?: string;
    image?: string;
  };
  showAvatar?: boolean;
  showEmail?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
}

const UserLink = ({ 
  user, 
  showAvatar = true, 
  showEmail = false, 
  size = 'md',
  className = '',
  variant = 'default'
}: UserLinkProps) => {
  const [imageError, setImageError] = useState(false);
  
  // Generate fallback avatar color
  const getAvatarColor = (email: string) => {
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue} 70% 45%)`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const sizeClasses = {
    sm: {
      avatar: 'w-6 h-6',
      text: 'text-sm',
      icon: 'w-3 h-3'
    },
    md: {
      avatar: 'w-8 h-8',
      text: 'text-base',
      icon: 'w-4 h-4'
    },
    lg: {
      avatar: 'w-12 h-12',
      text: 'text-lg',
      icon: 'w-5 h-5'
    }
  };

  const variantClasses = {
    default: 'flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors',
    compact: 'flex items-center gap-1 hover:bg-gray-50 rounded px-1 py-0.5 transition-colors',
    detailed: 'flex items-center gap-3 hover:bg-gray-50 rounded-xl p-3 transition-colors'
  };

  const avatarColor = getAvatarColor(user.email);
  const initials = getInitials(user.name);
  const hasUsername = user.username && user.username.trim() !== '';

  // If no username, just show the user info without link
  if (!hasUsername) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showAvatar && (
          <div className={`relative ${sizeClasses[size].avatar}`}>
            {user.image && !imageError ? (
              <img
                src={user.image}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div
                className="w-full h-full rounded-full flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: avatarColor }}
              >
                <span className={sizeClasses[size].text}>{initials}</span>
              </div>
            )}
          </div>
        )}
        <div className="flex flex-col">
          <span className={`font-medium text-gray-700 ${sizeClasses[size].text}`}>
            {user.name}
          </span>
          {showEmail && (
            <span className="text-gray-500 text-xs">{user.email}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <Link 
      href={`/profile/${user.username}`}
      className={`${variantClasses[variant]} ${className}`}
    >
      {showAvatar && (
        <div className={`relative ${sizeClasses[size].avatar}`}>
          {user.image && !imageError ? (
            <img
              src={user.image}
              alt={user.name}
              className="w-full h-full rounded-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div
              className="w-full h-full rounded-full flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: avatarColor }}
            >
              <span className={sizeClasses[size].text}>{initials}</span>
            </div>
          )}
        </div>
      )}
      
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span className={`font-medium text-gray-700 ${sizeClasses[size].text}`}>
            {user.name}
          </span>
          <ExternalLink className={`text-gray-400 ${sizeClasses[size].icon}`} />
        </div>
        {showEmail && (
          <span className="text-gray-500 text-xs">@{user.username}</span>
        )}
      </div>
    </Link>
  );
};

export default UserLink;
