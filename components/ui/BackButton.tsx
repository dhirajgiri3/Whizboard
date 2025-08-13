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
  variant = "dark",
  position = "relative",
  showLabel = true,
  size = "md",
  disabled = false,
  onBack,
}: BackButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
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

  // Size variants - Enhanced for dark theme
  const sizeClasses = {
    sm: "h-9 px-3 text-xs gap-1.5",
    md: "h-11 px-4 text-sm gap-2",
    lg: "h-12 px-5 text-base gap-2.5",
  };

  // Position variants
  const positionClasses = {
    fixed: "fixed top-6 left-6 z-50",
    absolute: "absolute top-18 left-6 z-20",
    relative: "relative z-10",
    sticky: "sticky top-6 z-30",
  };

  // Base styles optimized for dark theme
  const baseStyles = `
    group relative inline-flex items-center justify-center font-medium 
    rounded-xl transition-all duration-200 transform-gpu
    focus:outline-none focus:ring-2 focus:ring-offset-2 
    disabled:opacity-50 disabled:cursor-not-allowed
    min-h-[44px] min-w-[44px] backdrop-blur-sm cursor-pointer
    ${sizeClasses[size]}
    ${positionClasses[position]}
  `;

  // Enhanced variant styles matching design system
  const variantStyles = {
    light: `
      text-gray-700 hover:text-gray-900 
      bg-white hover:bg-gray-50 
      border border-gray-200 hover:border-gray-300
      shadow-sm hover:shadow-md
      focus:ring-blue-500 focus:ring-offset-white
      active:bg-gray-100
    `,
    dark: `
      text-white hover:text-blue-300 
      bg-white/[0.03] hover:bg-white/[0.08] 
      border border-white/[0.08] hover:border-white/[0.12]
      focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black
      active:bg-white/[0.12]
    `,
    minimal: `
      text-white/70 hover:text-white 
      hover:bg-white/[0.05] 
      focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black
      active:bg-white/[0.08]
    `,
  };

  const styles = `${baseStyles} ${variantStyles[variant]} ${className}`;

  // Icon size based on button size
  const iconSize = size === "sm" ? 14 : size === "lg" ? 18 : 16;

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled || isLoading}
      className={styles}
      aria-label={showLabel ? `Go back to ${label}` : "Go back"}
      aria-describedby={isLoading ? "back-button-loading" : undefined}
      whileHover={{
        scale: 1.02,
        y: -1,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      whileTap={{
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
        duration: 0.4
      }}
      style={{ pointerEvents: disabled || isLoading ? 'none' : 'auto' }}
    >
      {/* Enhanced hover effect - positioned properly */}
      <div
        className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
      />

      {/* Subtle gradient orb effect - contained within button */}
      <div className="absolute top-1 left-1 w-4 h-4 bg-blue-600/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative z-10 flex items-center gap-2">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex items-center justify-center"
            >
              <Loader2
                className="animate-spin text-blue-400"
                size={iconSize}
              />
            </motion.div>
          ) : (
            <motion.div
              key="arrow"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex items-center justify-center"
            >
              <ArrowLeft
                className="text-current group-hover:text-blue-300 transition-colors duration-200"
                size={iconSize}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {showLabel && (
          <motion.span
            className="hidden sm:inline whitespace-nowrap font-medium"
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            {label}
          </motion.span>
        )}
      </div>

      {/* Screen reader only loading indicator */}
      {isLoading && (
        <span id="back-button-loading" className="sr-only">
          Loading...
        </span>
      )}
    </motion.button>
  );
}


