"use client";

import { motion, easeOut } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  badge?: {
    icon: LucideIcon;
    text: string;
  };
  title: string;
  subtitle?: string;
  description?: string;
  stats?: Array<{
    icon: LucideIcon;
    text: string;
    color?: string;
  }>;
  alignment?: "left" | "center";
  size?: "default" | "large" | "hero";
  gradient?: boolean;
  className?: string;
  variant?: "minimal" | "enhanced" | "premium";
  disableAnimation?: boolean;
}

const SectionHeader = ({
  badge,
  title,
  subtitle,
  description,
  stats,
  alignment = "center",
  size = "default",
  gradient = true,
  className = "",
  variant = "enhanced",
  disableAnimation = false
}: SectionHeaderProps) => {
  const alignmentClasses = alignment === "center" ? "items-center text-center" : "items-start text-left";
  
  // Optimized typography scale with better spacing
  const titleSize = size === "hero" 
    ? "text-3xl sm:text-4xl md:text-5xl lg:text-6xl" 
    : size === "large"
    ? "text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
    : "text-xl sm:text-2xl md:text-3xl lg:text-4xl";

  // Refined animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.02
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: easeOut
      }
    }
  };

  // Minimal badge with cleaner styling
  const BadgeComponent = () => {
    if (!badge) return null;
    
    return (
      <motion.div
        variants={disableAnimation ? undefined : itemVariants}
        className="group relative inline-flex items-center gap-2 bg-white/[0.02] border border-white/[0.06] rounded-full px-3 py-1.5 backdrop-blur-sm hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-200"
      >
        <badge.icon className="h-3.5 w-3.5 text-blue-400/80 group-hover:text-blue-400 transition-colors duration-200" />
        <span className="text-white/70 text-xs font-medium tracking-wider uppercase group-hover:text-white/80 transition-colors duration-200">
          {badge.text}
        </span>
      </motion.div>
    );
  };

  // Cleaner title with refined gradient
  const TitleComponent = () => {
    if (gradient) {
      const words = title.split(' ');
      const lastWord = words.pop();
      const firstWords = words.join(' ');
      
      return (
        <motion.h2 
          variants={disableAnimation ? undefined : itemVariants}
          className={`${titleSize} font-bold text-white leading-[1.1] tracking-tight`}
        >
          {firstWords && <span className="text-white">{firstWords} </span>}
          <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400 bg-clip-text text-transparent">
            {lastWord}
          </span>
        </motion.h2>
      );
    }
    
    return (
      <motion.h2 
        variants={disableAnimation ? undefined : itemVariants}
        className={`${titleSize} font-bold text-white leading-[1.1] tracking-tight`}
      >
        {title}
      </motion.h2>
    );
  };

  // Refined subtitle
  const SubtitleComponent = () => (
    <motion.h3 
      variants={disableAnimation ? undefined : itemVariants}
      className="text-base sm:text-lg lg:text-xl font-medium text-white/85 leading-relaxed max-w-2xl"
    >
      {subtitle}
    </motion.h3>
  );

  // Cleaner description
  const DescriptionComponent = () => (
    <motion.p 
      variants={disableAnimation ? undefined : itemVariants}
      className="text-white/70 max-w-2xl leading-relaxed text-sm sm:text-base"
    >
      {description}
    </motion.p>
  );

  // Minimal stats with better spacing
  const StatsComponent = () => (
    <motion.div 
      variants={disableAnimation ? undefined : itemVariants}
      className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6"
    >
      {stats?.map((stat, index) => (
        <motion.div 
          key={index}
          className="group flex items-center gap-1.5 text-white/60 hover:text-white/80 transition-colors duration-200 px-2 py-1 rounded-md hover:bg-white/[0.02]"
          whileHover={{ y: -1 }}
          transition={{ duration: 0.15 }}
        >
          <stat.icon className={`h-3.5 w-3.5 ${stat.color || 'text-blue-400/70'} transition-colors duration-200`} />
          <span className="text-xs font-medium">{stat.text}</span>
        </motion.div>
      ))}
    </motion.div>
  );

  // Optimized container with better spacing
  const Container = motion.div;
  const containerProps = disableAnimation ? {
    className: `flex flex-col ${alignmentClasses} space-y-2 sm:space-y-3 lg:space-y-4 ${className}`
  } : {
    className: `flex flex-col ${alignmentClasses} space-y-2 sm:space-y-3 lg:space-y-4 ${className}`,
    variants: containerVariants,
    initial: "hidden",
    whileInView: "visible",
    viewport: { once: true, margin: "-30px" }
  };

  return (
    <Container {...containerProps}>
      {/* Refined badge with proper spacing */}
      <div className="flex flex-col items-center gap-4">
      {badge && (
        <div className="mb-0">
          <BadgeComponent />
        </div>
      )}

      {/* Title section with optimized spacing */}
      <div className="mb-0">
        <TitleComponent />
        {subtitle && <SubtitleComponent />}
      </div>

      {/* Description with proper spacing */}
      {description && (
        <div className="mt-0">
          <DescriptionComponent />
        </div>
      )}

      {/* Stats with clean spacing */}
      {stats && stats.length > 0 && (
        <div className="mt-0">
          <StatsComponent />
        </div>
      )}
      </div>
    </Container>
  );
};

export default SectionHeader;
