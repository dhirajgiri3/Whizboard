"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  gradient?: string;
  iconColor?: string;
  stats?: {
    users?: string;
    rating?: string;
    time?: string;
  };
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  hover?: boolean;
  variant?: "default" | "centered" | "minimal";
}

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  gradient = "from-blue-600/20 to-blue-500/20",
  iconColor = "text-blue-400",
  stats,
  onClick,
  className = "",
  size = "md",
  hover = true,
  variant = "default",
}: FeatureCardProps) => {
  const sizeClasses = {
    sm: "p-5 sm:p-6",
    md: "p-7 sm:p-8",
    lg: "p-9 sm:p-10",
  };

  const marginClasses = {
    sm: "mb-3 sm:mb-4",
    md: "mb-4 sm:mb-5",
    lg: "mb-5 sm:mb-6",
  };

  const borderRadiusClasses = {
    sm: "rounded-xl",
    md: "rounded-2xl",
    lg: "rounded-3xl",
  };

  const heightClasses = {
    sm: "h-48 sm:h-52",
    md: "h-56 sm:h-60",
    lg: "h-64 sm:h-72",
  };

  const getHeightClass = () => {
    if (variant === "minimal") {
      return "h-auto min-h-32";
    }
    return heightClasses[size];
  };

  const iconSizeClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4 sm:h-5 sm:w-5",
    lg: "h-5 w-5 sm:h-6 sm:w-6",
  };

  const iconContainerSizeClasses = {
    sm: "p-1.5 sm:p-2 rounded-lg",
    md: "p-2 sm:p-2.5 rounded-xl",
    lg: "p-2.5 sm:p-3 rounded-xl",
  };

  const titleSizeClasses = {
    sm: "text-sm sm:text-base",
    md: "text-base sm:text-lg",
    lg: "text-lg sm:text-xl",
  };

  const descriptionSizeClasses = {
    sm: "text-xs sm:text-sm",
    md: "text-sm sm:text-base",
    lg: "text-sm sm:text-base",
  };

  return (
    <motion.div
      className={`group relative ${className}`}
      whileHover={hover ? { y: -8 } : undefined}
      onClick={onClick}
    >
      <div className={`relative bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-500 overflow-hidden ${getHeightClass()} ${sizeClasses[size]} ${borderRadiusClasses[size]}`}>
        {/* Gradient Orb Background */}
        <div
          className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[40px] group-hover:scale-110 transition-transform duration-500 ${gradient.includes("amber") ? "bg-amber-600/20" : gradient.includes("blue") ? "bg-blue-600/20" : "bg-emerald-600/20"}`}
        />

        {/* Content */}
        <div className={`relative z-10 flex flex-col h-full justify-between ${variant === "centered" ? "text-center items-center" : ""}`}>
          {/* Header Section */}
          <div className={`flex items-center ${variant === "centered" ? "justify-center" : "justify-between"} ${marginClasses[size]} ${variant === "centered" ? "w-full" : ""}`}>
            <div
              className={`inline-flex ${iconContainerSizeClasses[size]} border group-hover:scale-105 transition-all duration-300 ${
                gradient.includes("amber")
                  ? "bg-amber-600/10 border-amber-600/20 group-hover:bg-amber-600/15"
                  : gradient.includes("blue")
                  ? "bg-blue-600/10 border-blue-600/20 group-hover:bg-blue-600/15"
                  : "bg-emerald-600/10 border-emerald-600/20 group-hover:bg-emerald-600/15"
              }`}
            >
              <Icon className={`${iconSizeClasses[size]} ${iconColor}`} />
            </div>
            {stats?.time && variant !== "centered" && (
              <span className={`font-medium bg-white/[0.05] rounded-full ${iconColor} ${
                size === "sm" 
                  ? "text-xs px-1.5 py-0.5" 
                  : size === "md" 
                  ? "text-xs px-2 py-1" 
                  : "text-sm px-2.5 py-1.5"
              }`}>
                {stats.time}
              </span>
            )}
          </div>
          
          {/* Content Section */}
          <div className="flex flex-col flex-grow">
            <h3 className={`${titleSizeClasses[size]} font-semibold text-white ${marginClasses[size]} group-hover:text-white transition-colors`}>
              {title}
            </h3>
            
            <p className={`${descriptionSizeClasses[size]} text-white/70 leading-[1.6] group-hover:text-white/80 transition-colors ${marginClasses[size]}`}>
              {description}
            </p>
          </div>
        </div>

        {/* Hover effect border */}
        <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/10 to-gray-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl ${borderRadiusClasses[size]}`} />
      </div>
    </motion.div>
  );
};

export default FeatureCard;
