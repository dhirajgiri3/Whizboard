"use client";

import { Palette, Users, Zap, Layers, Share2, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  showIcon?: boolean;
  className?: string;
  variant?: 'default' | 'minimal' | 'dots' | 'whiteboard' | 'collaboration' | 'pulse-grid';
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

  if (variant === 'whiteboard') {
    return (
      <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
        <div className="relative">
          {/* Animated whiteboard canvas */}
          <div className="w-20 h-14 bg-white rounded-lg shadow-lg border-2 border-slate-200 relative overflow-hidden">
            {/* Drawing lines animation */}
            <svg className="absolute inset-0 w-full h-full">
              <path
                d="M4 6 L16 6 M4 8 L12 8 M4 10 L14 10"
                stroke="#3b82f6"
                strokeWidth="1"
                fill="none"
                strokeDasharray="20"
                strokeDashoffset="20"
                className="animate-pulse"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  values="20;0;20"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </path>
            </svg>
          </div>
          
          {/* Floating tools */}
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-bounce">
            <Palette className="w-3 h-3 text-white" />
          </div>
          
          {/* Collaboration indicator */}
          <div className="absolute -bottom-1 -left-1 flex -space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded-full border border-white animate-pulse"></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full border border-white animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>
        </div>
        
        {text && (
          <div className={`${sizes.text} font-medium text-slate-600 animate-pulse`}>
            {text}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'collaboration') {
    return (
      <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
        <div className="relative">
          {/* Central hub */}
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <Users className="w-8 h-8 text-white animate-pulse" />
          </div>
          
          {/* Orbiting collaboration indicators */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-green-500 rounded-full shadow-md"></div>
            <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 w-4 h-4 bg-yellow-500 rounded-full shadow-md"></div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full shadow-md"></div>
            <div className="absolute top-1/2 -left-2 transform -translate-y-1/2 w-4 h-4 bg-indigo-500 rounded-full shadow-md"></div>
          </div>
          
          {/* Pulse rings */}
          <div className="absolute inset-0 animate-ping">
            <div className="w-full h-full bg-blue-400 rounded-full opacity-20"></div>
          </div>
          <div className="absolute inset-0 animate-ping" style={{ animationDelay: '1s' }}>
            <div className="w-full h-full bg-purple-400 rounded-full opacity-20"></div>
          </div>
        </div>
        
        {text && (
          <div className={`${sizes.text} font-medium text-slate-600 animate-pulse`}>
            {text}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'pulse-grid') {
    return (
      <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg animate-pulse"
              style={{ 
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1.5s'
              }}
            />
          ))}
        </div>
        
        {text && (
          <div className={`${sizes.text} font-medium text-slate-600 animate-pulse`}>
            {text}
          </div>
        )}
      </div>
    );
  }

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

// Enhanced full screen loading overlay for whiteboard
export function LoadingOverlay({ 
  text = "Loading...", 
  variant = 'whiteboard',
  subtitle = "Preparing your collaborative workspace"
}: { 
  text?: string; 
  variant?: 'default' | 'minimal' | 'dots' | 'whiteboard' | 'collaboration';
  subtitle?: string;
}) {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 15;
      });
    }, 200);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50/98 via-blue-50/98 to-indigo-100/98 backdrop-blur-md z-50 flex items-center justify-center">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-600 rounded-full animate-ping"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-600 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-indigo-600 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-pink-600 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
      </div>
      
      <div className="text-center relative z-10">
        <Loading size="xl" text={text} variant={variant} />
        {subtitle && (
          <p className="text-slate-500 text-sm mt-3 leading-relaxed max-w-sm">{subtitle}</p>
        )}
        
        {/* Progress bar */}
        <div className="mt-6 w-64 h-1 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs text-slate-400 mt-2">{Math.round(progress)}% complete</div>
      </div>
    </div>
  );
}

// Whiteboard-specific page loading
export function WhiteboardPageLoading({ 
  title = "Loading Whiteboard", 
  description = "Setting up your collaborative canvas and syncing with team members",
  variant = 'collaboration'
}: { 
  title?: string; 
  description?: string;
  variant?: 'default' | 'minimal' | 'dots' | 'whiteboard' | 'collaboration';
}) {
  const [loadingSteps, setLoadingSteps] = useState([
    { text: "Initializing canvas", completed: false },
    { text: "Connecting to collaboration server", completed: false },
    { text: "Syncing whiteboard data", completed: false },
    { text: "Loading drawing tools", completed: false },
    { text: "Preparing workspace", completed: false }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setLoadingSteps(prev => {
        const nextIncomplete = prev.findIndex(step => !step.completed);
        if (nextIncomplete === -1) return prev;
        
        const updated = [...prev];
        updated[nextIncomplete] = { ...updated[nextIncomplete], completed: true };
        return updated;
      });
    }, 800);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-12 gap-4 h-full">
          {Array.from({ length: 120 }).map((_, i) => (
            <div
              key={i}
              className="border border-slate-300 animate-pulse"
              style={{ animationDelay: `${i * 0.05}s` }}
            />
          ))}
        </div>
      </div>
      
      <div className="text-center max-w-md mx-auto px-6 relative z-10">
        <Loading size="xl" text={title} variant={variant} />
        <p className="text-slate-500 text-sm mt-4 leading-relaxed">{description}</p>
        
        {/* Loading steps */}
        <div className="mt-8 space-y-2">
          {loadingSteps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center text-xs transition-all duration-500 ${
                step.completed ? 'text-green-600' : 'text-slate-400'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full mr-2 transition-all duration-500 ${
                step.completed ? 'bg-green-500' : 'bg-slate-300'
              }`} />
              {step.text}
              {step.completed && <Sparkles className="w-3 h-3 ml-1 text-green-500" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Collaboration status loader
export function CollaborationLoader({ 
  userCount = 0,
  className = '' 
}: { 
  userCount?: number;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div className="w-5 h-5 border-2 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></div>
      </div>
      <span className="text-sm text-slate-600">
        Syncing with {userCount} collaborator{userCount !== 1 ? 's' : ''}...
      </span>
    </div>
  );
}

// Tool loading for whiteboard tools
export function ToolLoader({ 
  toolName = "Drawing tool",
  className = '' 
}: { 
  toolName?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex space-x-1">
        <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce"></div>
        <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      <span className="text-xs text-slate-500">Loading {toolName}...</span>
    </div>
  );
}