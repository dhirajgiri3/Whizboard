"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type BackButtonProps = {
  label?: string;
  fallbackHref?: string;
  className?: string;
  variant?: "light" | "dark" | "minimal";
  position?: "fixed" | "absolute" | "relative" | "sticky";
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onBack?: () => void | Promise<void>;
};

export default function BackButton({
  label = "Back",
  fallbackHref = "/",
  className = "",
  variant = "light",
  position = "relative",
  showLabel = true,
  size = "md",
  disabled = false,
  onBack,
}: BackButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Handle back navigation with loading state
  const handleClick = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    
    try {
      // Call custom onBack handler if provided
      if (onBack) {
        await onBack();
        return;
      }

      // Default navigation logic
      if (typeof window !== "undefined" && window.history.length > 1) {
        router.back();
      } else {
        router.push(fallbackHref);
      }
    } catch (error) {
      console.error("Navigation error:", error);
      // Fallback to direct navigation
      router.push(fallbackHref);
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard navigation support
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  // Focus management
  useEffect(() => {
    const button = buttonRef.current;
    if (button && position === "fixed") {
      // Ensure fixed positioned buttons are focusable
      button.style.zIndex = "40";
    }
  }, [position]);

  // Size variants
  const sizeClasses = {
    sm: "h-8 px-2.5 text-xs",
    md: "h-10 px-3 text-sm",
    lg: "h-12 px-4 text-base",
  };

  // Position variants
  const positionClasses = {
    fixed: "fixed top-4 left-4 z-40",
    absolute: "absolute top-4 left-4 z-10",
    relative: "relative",
    sticky: "sticky top-4 z-10",
  };

  // Base styles with improved accessibility
  const baseStyles = `
    inline-flex items-center justify-center gap-2 
    rounded-lg font-medium transition-all duration-200 
    focus:outline-none focus:ring-2 focus:ring-offset-2 
    disabled:opacity-50 disabled:cursor-not-allowed
    min-h-[44px] min-w-[44px]
    ${sizeClasses[size]}
    ${positionClasses[position]}
  `;

  // Variant styles with better contrast and accessibility
  const variantStyles = {
    light: `
      text-slate-700 hover:text-slate-900 
      bg-white hover:bg-slate-50 
      border border-slate-200 hover:border-slate-300
      shadow-sm hover:shadow-md
      focus:ring-blue-500 focus:ring-offset-white
      active:bg-slate-100 active:scale-95
    `,
    dark: `
      text-white/90 hover:text-white 
      bg-white/10 hover:bg-white/20 
      border border-white/20 hover:border-white/30
      backdrop-blur-sm
      focus:ring-blue-400 focus:ring-offset-gray-900
      active:bg-white/30 active:scale-95
    `,
    minimal: `
      text-slate-600 hover:text-slate-900 
      hover:bg-slate-100 
      focus:ring-blue-500 focus:ring-offset-white
      active:bg-slate-200 active:scale-95
    `,
  };

  const styles = `${baseStyles} ${variantStyles[variant]} ${className}`;

  // Icon size based on button size
  const iconSize = size === "sm" ? 16 : size === "lg" ? 20 : 18;

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      disabled={disabled || isLoading}
      className={styles}
      aria-label={showLabel ? `Go back to ${label}` : "Go back"}
      aria-describedby={isLoading ? "back-button-loading" : undefined}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
      }}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <Loader2 className={`w-${iconSize} h-${iconSize} animate-spin`} />
          </motion.div>
        ) : (
          <motion.div
            key="arrow"
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.2 }}
          >
            <ArrowLeft className={`w-${iconSize} h-${iconSize}`} />
          </motion.div>
        )}
      </AnimatePresence>

      {showLabel && (
        <motion.span
          className="hidden sm:inline whitespace-nowrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {label}
        </motion.span>
      )}

      {/* Screen reader only loading indicator */}
      {isLoading && (
        <span id="back-button-loading" className="sr-only">
          Loading...
        </span>
      )}
    </motion.button>
  );
}


