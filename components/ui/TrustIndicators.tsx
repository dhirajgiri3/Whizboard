"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Shield, Zap, Users, Clock } from "lucide-react";

interface TrustIndicator {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  color?: string;
}

interface TrustIndicatorsProps {
  indicators?: TrustIndicator[];
  variant?: "horizontal" | "vertical";
  size?: "sm" | "md";
  className?: string;
  withMotion?: boolean;
}

const defaultIndicators: TrustIndicator[] = [
  {
    icon: CheckCircle,
    text: "No credit card required",
    color: "text-emerald-400",
  },
  {
    icon: Shield,
    text: "Bank-level security",
    color: "text-blue-400",
  },
  {
    icon: Zap,
    text: "Setup in 30 seconds",
    color: "text-blue-400",
  },
];

const TrustIndicators = ({
  indicators = defaultIndicators,
  variant = "horizontal",
  size = "md",
  className = "",
  withMotion = true,
}: TrustIndicatorsProps) => {
  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
  };

  const iconSizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
  };

  const containerClasses = variant === "horizontal" 
    ? "flex flex-col sm:flex-row items-center justify-center gap-8 md:gap-20" 
    : "flex flex-col items-center gap-6";

  const Container = withMotion ? motion.div : "div";
  const Item = withMotion ? motion.div : "div";

  return (
    <Container
      {...(withMotion && {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
      })}
      className={`${containerClasses} ${sizeClasses[size]} text-white/50 ${className}`}
    >
      {indicators.map((indicator, index) => (
        <Item
          key={indicator.text}
          {...(withMotion && {
            initial: { opacity: 0, y: 10 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true },
            transition: { duration: 0.4, delay: index * 0.1 }
          })}
          className="flex items-center gap-2 group hover:text-white/80 transition-colors duration-200"
        >
          <indicator.icon 
            className={`${iconSizeClasses[size]} ${indicator.color || "text-blue-400"} group-hover:scale-110 transition-transform duration-200`} 
          />
          <span>{indicator.text}</span>
        </Item>
      ))}
    </Container>
  );
};

export default TrustIndicators;
