"use client";

import { Palette } from 'lucide-react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  showIcon?: boolean;
  className?: string;
  variant?: 'default' | 'minimal' | 'dots';
}

const sizeClasses = {
  sm: {
    container: 'w-6 h-6',
    icon: 'w-3 h-3',
    text: 'text-sm',
    spinner: 'w-4 h-4',
  },
  md: {
    container: 'w-8 h-8',
    icon: 'w-4 h-4',
    text: 'text-base',
    spinner: 'w-6 h-6',
  },
  lg: {
    container: 'w-12 h-12',
    icon: 'w-6 h-6',
    text: 'text-lg',
    spinner: 'w-8 h-8',
  },
  xl: {
    container: 'w-16 h-16',
    icon: 'w-8 h-8',
    text: 'text-xl',
    spinner: 'w-12 h-12',
  },
};

export default function Loading({ 
  size = 'md', 
  text, 
  showIcon = true, 
  className = '',
  variant = 'default'
}: LoadingProps) {
  const sizes = sizeClasses[size];

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className={`${sizes.spinner} border-3 border-slate-200 border-t-blue-600 rounded-full animate-spin`}></div>
        {text && (
          <span className={`ml-3 ${sizes.text} font-medium text-slate-600`}>
            {text}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={`flex items-center justify-center gap-2 ${className}`}>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        {text && (
          <span className={`ml-3 ${sizes.text} font-medium text-slate-600`}>
            {text}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="relative">
        {/* Outer spinning ring */}
        <div 
          className={`${sizes.container} border-4 border-blue-200 rounded-full`}
        ></div>
        
        {/* Inner spinning ring */}
        <div 
          className={`absolute top-0 left-0 ${sizes.container} border-4 border-blue-600 border-t-transparent rounded-full animate-spin`}
        ></div>
        
        {/* Center icon */}
        {showIcon && (
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}>
            <Palette className={`${sizes.icon} text-blue-600 animate-pulse`} />
          </div>
        )}
      </div>
      
      {text && (
        <div className={`${sizes.text} font-medium text-slate-600 animate-pulse`}>
          {text}
        </div>
      )}
    </div>
  );
}

// Full screen loading overlay
export function LoadingOverlay({ 
  text = "Loading...", 
  variant = 'default' 
}: { 
  text?: string; 
  variant?: 'default' | 'minimal' | 'dots';
}) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50/95 via-blue-50/95 to-indigo-100/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <Loading size="xl" text={text} variant={variant} />
      </div>
    </div>
  );
}

// Inline loading for buttons
export function ButtonLoading({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const spinnerSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  
  return (
    <div className={`${spinnerSize} border-2 border-white/30 border-t-white rounded-full animate-spin`}></div>
  );
}

// Page loading component
export function PageLoading({ 
  title = "Loading", 
  description = "Please wait while we prepare your content",
  variant = 'default'
}: { 
  title?: string; 
  description?: string;
  variant?: 'default' | 'minimal' | 'dots';
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <Loading size="xl" text={title} variant={variant} />
        <p className="text-slate-500 text-sm mt-4 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// Skeleton loader for content
export function SkeletonLoader({ 
  lines = 3, 
  className = '' 
}: { 
  lines?: number; 
  className?: string;
}) {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-slate-200 rounded-lg mb-3 ${
            i === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        ></div>
      ))}
    </div>
  );
}
