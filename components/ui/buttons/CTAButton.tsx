"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

interface CTAButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "white" | "emerald" | "blue";
  size?: "sm" | "md" | "lg";
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  icon?: "arrow" | "play" | "none";
  className?: string;
  disabled?: boolean;
  theme?: "hero" | "value-prop" | "social-proof" | "pricing" | "features" | "about";
}

const CTAButton = ({
  variant = "primary",
  size = "md",
  href,
  onClick,
  children,
  icon = "arrow",
  className = "",
  disabled = false,
  theme = "hero",
}: CTAButtonProps) => {
  const baseClasses = "inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black w-full sm:w-auto min-h-[44px] touch-manipulation";
  
  const sizeClasses = {
    sm: "px-4 py-2.5 sm:px-5 text-sm rounded-lg",
    md: "px-6 py-3.5 sm:px-7 text-base rounded-xl",
    lg: "px-8 py-4 sm:px-10 sm:py-4.5 text-lg rounded-xl",
  };
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-600/25 hover:shadow-blue-600/35 focus:ring-blue-500/50",
    secondary: "bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] text-white hover:bg-white/[0.08] hover:border-white/[0.15] focus:ring-white/20",
    ghost: "text-white/80 hover:text-white font-medium hover:bg-white/[0.04] focus:ring-white/20",
    white: "bg-white text-black hover:bg-white/90 shadow-lg shadow-white/10 hover:shadow-white/20 focus:ring-white/50",
    emerald: "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 focus:ring-emerald-500/50",
    blue: "bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 focus:ring-blue-400/50",
  };

  // Theme-specific overrides
  const themeClasses = {
    hero: "",
    "value-prop": variant === "primary" ? "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-emerald-600/25 hover:shadow-emerald-600/35 focus:ring-emerald-500/50" : "",
    "social-proof": variant === "primary" ? "bg-white text-black hover:bg-white/90 shadow-white/10 hover:shadow-white/20 focus:ring-white/50" : "",
    pricing: variant === "primary" ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-blue-600/25 hover:shadow-blue-600/35 focus:ring-blue-500/50" : "",
    features: variant === "ghost" ? "text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 focus:ring-blue-400/20" : "",
    about: variant === "primary" ? "bg-white text-black hover:bg-white/90 shadow-white/10 hover:shadow-white/20 focus:ring-white/50" : "",
  };

  const iconComponent = {
    arrow: <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1 flex-shrink-0" />,
    play: <Play className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110 flex-shrink-0" />,
    none: null,
  };

  const buttonContent = (
    <motion.span
      className="flex items-center justify-center gap-2 w-full"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="text-center truncate">{children}</span>
      {icon !== "none" && iconComponent[icon]}
    </motion.span>
  );

  const responsiveClasses = "max-w-full sm:max-w-none text-center sm:text-left";

  if (href) {
    return (
      <motion.a
        href={href}
        className={`group ${baseClasses} ${sizeClasses[size]} ${themeClasses[theme] || variantClasses[variant]} ${responsiveClasses} ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={onClick}
        aria-disabled={disabled}
      >
        {buttonContent}
      </motion.a>
    );
  }

  return (
    <motion.button
      className={`group ${baseClasses} ${sizeClasses[size]} ${themeClasses[theme] || variantClasses[variant]} ${responsiveClasses} ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {buttonContent}
    </motion.button>
  );
};

export default CTAButton;
