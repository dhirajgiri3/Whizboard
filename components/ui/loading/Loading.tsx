"use client";

import { Palette, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  showIcon?: boolean;
  className?: string;
  variant?: 'default' | 'minimal' | 'dots' | 'whiteboard' | 'collaboration' | 'pulse-grid';
  tone?: 'light' | 'dark';
  ariaLabel?: string;
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
  variant = 'default',
  tone = 'light',
  ariaLabel = 'Loading'
}: LoadingProps) {
  const sizes = sizeClasses[size];
  const prefersReducedMotion = useReducedMotion();
  const isDarkTone = tone === 'dark';
  const primaryTextClass = isDarkTone ? 'text-white/90' : 'text-gray-700';
  const secondaryTextClass = isDarkTone ? 'text-white/70' : 'text-gray-600';
  const spinnerTrackClass = isDarkTone ? 'border-white/10' : 'border-gray-200';
  const spinnerAccentClass = isDarkTone ? 'border-t-blue-400' : 'border-t-blue-600';

  if (variant === 'whiteboard') {
    return (
      <motion.div
        role="status"
        aria-live="polite"
        aria-label={ariaLabel}
        className={`flex flex-col items-center justify-center gap-4 ${className}`}
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? undefined : { duration: 0.3, ease: "easeOut" }}
      >
        <div className="relative">
          {/* Animated whiteboard canvas */}
          <div className="w-20 h-14 bg-white rounded-lg shadow-lg border border-gray-200 relative overflow-hidden">
            {/* Drawing lines animation */}
            <svg className="absolute inset-0 w-full h-full">
              <motion.path
                d="M4 6 L16 6 M4 8 L12 8 M4 10 L14 10"
                stroke="#3b82f6"
                strokeWidth="1"
                fill="none"
                strokeDasharray="20"
                strokeDashoffset="20"
                animate={prefersReducedMotion ? undefined : { strokeDashoffset: [20, 0, 20] }}
                transition={prefersReducedMotion ? undefined : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </svg>
          </div>
          
          {/* Floating tools */}
          <motion.div
            className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center"
            animate={prefersReducedMotion ? undefined : { y: [0, -4, 0] }}
            transition={prefersReducedMotion ? undefined : { duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Palette className="w-3 h-3 text-white" />
          </motion.div>
          
          {/* Collaboration indicator */}
          <div className="absolute -bottom-1 -left-1 flex -space-x-1">
            <motion.div
              className="w-3 h-3 bg-emerald-600 rounded-full border border-white animate-pulse"
              animate={prefersReducedMotion ? undefined : { scale: [1, 1.2, 1] }}
              transition={prefersReducedMotion ? undefined : { duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="w-3 h-3 bg-blue-600 rounded-full border border-white"
              animate={prefersReducedMotion ? undefined : { scale: [1, 1.2, 1] }}
              transition={prefersReducedMotion ? undefined : { duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            />
          </div>
        </div>
        
        {text && (
          <motion.div
            className={`${sizes.text} font-medium ${primaryTextClass}`}
            animate={prefersReducedMotion ? undefined : { opacity: [0.7, 1, 0.7] }}
            transition={prefersReducedMotion ? undefined : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {text}
          </motion.div>
        )}
      </motion.div>
    );
  }

  if (variant === 'collaboration') {
    return (
      <motion.div
        role="status"
        aria-live="polite"
        aria-label={ariaLabel}
        className={`flex flex-col items-center justify-center gap-4 ${className}`}
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? undefined : { duration: 0.3, ease: "easeOut" }}
      >
        <div className="relative">
          {/* Central hub */}
          <motion.div
            className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg"
            animate={prefersReducedMotion ? undefined : { scale: [1, 1.05, 1] }}
            transition={prefersReducedMotion ? undefined : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Users className="w-8 h-8 text-white" />
          </motion.div>
          
          {/* Orbiting collaboration indicators */}
          <motion.div
            className="absolute inset-0"
            animate={prefersReducedMotion ? undefined : { rotate: 360 }}
            transition={prefersReducedMotion ? undefined : { duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-emerald-600 rounded-full shadow-md"></div>
            <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 w-4 h-4 bg-amber-600 rounded-full shadow-md"></div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-red-600 rounded-full shadow-md"></div>
            <div className="absolute top-1/2 -left-2 transform -translate-y-1/2 w-4 h-4 bg-blue-600 rounded-full shadow-md"></div>
          </motion.div>
          
          {/* Pulse rings */}
          <motion.div
            className="absolute inset-0"
            animate={prefersReducedMotion ? undefined : { scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
            transition={prefersReducedMotion ? undefined : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-full h-full bg-blue-600 rounded-full"></div>
          </motion.div>
        </div>
        
        {text && (
          <motion.div
            className={`${sizes.text} font-medium ${primaryTextClass}`}
            animate={prefersReducedMotion ? undefined : { opacity: [0.7, 1, 0.7] }}
            transition={prefersReducedMotion ? undefined : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {text}
          </motion.div>
        )}
      </motion.div>
    );
  }

  if (variant === 'pulse-grid') {
    return (
      <motion.div
        role="status"
        aria-live="polite"
        aria-label={ariaLabel}
        className={`flex flex-col items-center justify-center gap-4 ${className}`}
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? undefined : { duration: 0.3, ease: "easeOut" }}
      >
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-4 h-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg"
              animate={prefersReducedMotion ? undefined : { scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
              transition={prefersReducedMotion ? undefined : { duration: 1.5, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
            />
          ))}
        </div>
        
        {text && (
          <motion.div
            className={`${sizes.text} font-medium ${primaryTextClass}`}
            animate={prefersReducedMotion ? undefined : { opacity: [0.7, 1, 0.7] }}
            transition={prefersReducedMotion ? undefined : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {text}
          </motion.div>
        )}
      </motion.div>
    );
  }

  if (variant === 'minimal') {
    return (
      <motion.div
        role="status"
        aria-live="polite"
        aria-label={ariaLabel}
        className={`flex items-center justify-center ${className}`}
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? undefined : { duration: 0.3, ease: "easeOut" }}
      >
        <motion.div
          className={`${sizes.spinner} border-2 ${spinnerTrackClass} ${spinnerAccentClass} rounded-full`}
          animate={prefersReducedMotion ? undefined : { rotate: 360 }}
          transition={prefersReducedMotion ? undefined : { duration: 1, repeat: Infinity, ease: "linear" }}
        />
        {text && (
          <motion.span
            className={`ml-3 ${sizes.text} font-medium ${primaryTextClass}`}
            animate={prefersReducedMotion ? undefined : { opacity: [0.7, 1, 0.7] }}
            transition={prefersReducedMotion ? undefined : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {text}
          </motion.span>
        )}
      </motion.div>
    );
  }

  if (variant === 'dots') {
    return (
      <motion.div
        role="status"
        aria-live="polite"
        aria-label={ariaLabel}
        className={`flex items-center justify-center gap-2 ${className}`}
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? undefined : { duration: 0.3, ease: "easeOut" }}
      >
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-blue-600 rounded-full"
              animate={prefersReducedMotion ? undefined : { y: [0, -6, 0] }}
              transition={prefersReducedMotion ? undefined : { duration: 0.6, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
            />
          ))}
        </div>
        {text && (
          <motion.span
            className={`ml-3 ${sizes.text} font-medium ${primaryTextClass}`}
            animate={prefersReducedMotion ? undefined : { opacity: [0.7, 1, 0.7] }}
            transition={prefersReducedMotion ? undefined : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {text}
          </motion.span>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? undefined : { duration: 0.3, ease: "easeOut" }}
    >
      <div className="relative">
        {/* Outer spinning ring */}
        <div 
          className={`${sizes.container} border-4 ${spinnerTrackClass} rounded-full`}
        />
        
        {/* Inner spinning ring */}
        <motion.div
          className={`absolute top-0 left-0 ${sizes.container} border-4 ${isDarkTone ? 'border-blue-400' : 'border-blue-600'} border-t-transparent rounded-full`}
          animate={prefersReducedMotion ? undefined : { rotate: 360 }}
          transition={prefersReducedMotion ? undefined : { duration: 1, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Center icon */}
        {showIcon && (
          <motion.div
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}
            animate={prefersReducedMotion ? undefined : { scale: [1, 1.1, 1] }}
            transition={prefersReducedMotion ? undefined : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Palette className={`${sizes.icon} ${isDarkTone ? 'text-blue-400' : 'text-blue-600'}`} />
          </motion.div>
        )}
      </div>
      
      {text && (
        <motion.div
          className={`${sizes.text} font-medium ${primaryTextClass}`}
          animate={prefersReducedMotion ? undefined : { opacity: [0.7, 1, 0.7] }}
          transition={prefersReducedMotion ? undefined : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {text}
        </motion.div>
      )}
    </motion.div>
  );
}

// Enhanced full screen loading overlay for whiteboard
export function LoadingOverlay({ 
  text = "Loading...", 
  variant = 'whiteboard',
  subtitle = "Preparing your collaborative workspace",
  theme = 'dark'
}: { 
  text?: string; 
  variant?: 'default' | 'minimal' | 'dots' | 'whiteboard' | 'collaboration';
  subtitle?: string;
  theme?: 'dark' | 'light';
}) {
  const [progress, setProgress] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return Math.min(prev + Math.random() * 10, 100);
      });
    }, 200);
    
    return () => clearInterval(timer);
  }, []);

  const isDark = theme === 'dark';

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Loading overlay"
      className={`fixed inset-0 z-50 flex items-center justify-center ${isDark ? 'bg-[#0f1115]/95' : 'bg-white'}`}
      initial={prefersReducedMotion ? undefined : { opacity: 0 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1 }}
      exit={prefersReducedMotion ? undefined : { opacity: 0 }}
      transition={prefersReducedMotion ? undefined : { duration: 0.3 }}
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-600 rounded-full">
          <motion.div
            className="w-full h-full bg-blue-600 rounded-full"
            animate={prefersReducedMotion ? undefined : { scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
            transition={prefersReducedMotion ? undefined : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-gray-500 rounded-full">
          <motion.div
            className="w-full h-full bg-gray-500 rounded-full"
            animate={prefersReducedMotion ? undefined : { scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
            transition={prefersReducedMotion ? undefined : { duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-blue-600 rounded-full">
          <motion.div
            className="w-full h-full bg-blue-600 rounded-full"
            animate={prefersReducedMotion ? undefined : { scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
            transition={prefersReducedMotion ? undefined : { duration: 2, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </div>
      </div>
      
      <motion.div
        className="text-center relative z-10"
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? undefined : { duration: 0.5, delay: 0.2 }}
      >
        <Loading size="xl" text={text} variant={variant} tone={isDark ? 'dark' : 'light'} />
        {subtitle && (
          <motion.p
            className={`${isDark ? 'text-white/75' : 'text-gray-600'} text-sm mt-3 leading-relaxed max-w-sm`}
            initial={prefersReducedMotion ? undefined : { opacity: 0 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1 }}
            transition={prefersReducedMotion ? undefined : { duration: 0.5, delay: 0.4 }}
          >
            {subtitle}
          </motion.p>
        )}
        
        {/* Progress bar */}
        <motion.div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          className={`mt-6 w-64 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}
          initial={prefersReducedMotion ? undefined : { opacity: 0, scaleX: 0 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, scaleX: 1 }}
          transition={prefersReducedMotion ? undefined : { duration: 0.5, delay: 0.6 }}
        >
          <motion.div
            className={`h-full rounded-full ${isDark ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-blue-600 to-blue-700'}`}
            initial={prefersReducedMotion ? undefined : { width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={prefersReducedMotion ? undefined : { duration: 0.3, ease: "easeOut" }}
          />
        </motion.div>
        <motion.div
          className={`text-xs mt-2 ${isDark ? 'text-white/70' : 'text-gray-500'}`}
          initial={prefersReducedMotion ? undefined : { opacity: 0 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1 }}
          transition={prefersReducedMotion ? undefined : { duration: 0.5, delay: 0.8 }}
        >
          {Math.round(progress)}% complete
        </motion.div>
      </motion.div>
    </motion.div>
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
    <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-12 gap-4 h-full">
          {Array.from({ length: 120 }).map((_, i) => (
            <motion.div
              key={i}
              className="border border-gray-300"
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.05 }}
            />
          ))}
        </div>
      </div>
      
      <motion.div 
        className="text-center max-w-md mx-auto px-6 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Loading size="xl" text={title} variant={variant} />
        <motion.p 
          className="text-gray-600 text-sm mt-4 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {description}
        </motion.p>
        
        {/* Loading steps */}
        <div className="mt-8 space-y-2">
          {loadingSteps.map((step, index) => (
            <motion.div
              key={index}
              className={`flex items-center text-xs transition-all duration-500 ${
                step.completed ? 'text-emerald-600' : 'text-gray-400'
              }`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <motion.div 
                className={`w-1.5 h-1.5 rounded-full mr-2 transition-all duration-500 ${
                  step.completed ? 'bg-emerald-500' : 'bg-gray-300'
                }`}
                animate={step.completed ? { scale: [1, 1.5, 1] } : {}}
                transition={{ duration: 0.3 }}
              />
              {step.text}
              {step.completed && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <CheckCircle className="w-3 h-3 ml-1 text-emerald-500" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
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
    <motion.div 
      className={`flex items-center gap-2 ${className}`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <motion.div 
          className="w-5 h-5 border-2 border-emerald-200 border-t-emerald-600 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-emerald-600 rounded-full"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <span className="text-sm text-gray-700">
        Syncing with {userCount} collaborator{userCount !== 1 ? 's' : ''}...
      </span>
    </motion.div>
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
    <motion.div 
      className={`flex items-center gap-2 ${className}`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1 h-1 bg-blue-600 rounded-full"
            animate={{ y: [0, -4, 0] }}
            transition={{ 
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      <span className="text-xs text-gray-500">Loading {toolName}...</span>
    </motion.div>
  );
}

// CheckCircle icon component (since we're using it)
const CheckCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);