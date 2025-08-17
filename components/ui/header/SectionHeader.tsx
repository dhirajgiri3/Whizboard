"use client";

import { motion } from "framer-motion";
import { LucideIcon, CheckCircle } from "lucide-react";
import type { Variants, Easing } from "framer-motion";

/**
 * SectionHeader - Minimal, modern, and premium section header for Whizboard.
 * Follows strict design system: clean, subtle, professional, and blue/neutral palette.
 */
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
  useCases?: Array<string>;
  alignment?: "left" | "center";
  size?: "default" | "large" | "hero";
  gradient?: boolean;
  className?: string;
  variant?: "minimal" | "enhanced" | "premium";
  disableAnimation?: boolean;
}

const easeCubicBezier: Easing = [0.4, 0, 0.2, 1];

// Typography scale from design system
const titleSizeMap = {
  hero: "heading-main", // gradient, bold, large
  large: "headline-lg", // large, bold
  default: "text-xl xs:text-2xl sm:text-3xl md:text-4xl font-semibold", // fallback
};

const SectionHeader = ({
  badge,
  title,
  subtitle,
  description,
  stats,
  useCases,
  alignment = "center",
  size = "default",
  gradient = true,
  className = "",
  disableAnimation = false,
}: SectionHeaderProps) => {
  // Alignment classes - improved responsive alignment
  const alignmentClasses =
    alignment === "center"
      ? "items-center text-center"
      : "items-start text-left";

  // Animation variants (minimal, subtle)
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.01,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.28,
        ease: easeCubicBezier,
      },
    },
  };

  // Badge: minimal, glass, blue accent, subtle hover - improved responsive design
  const BadgeComponent = () =>
    badge ? (
      <motion.div
        variants={disableAnimation ? undefined : itemVariants}
        className="group inline-flex items-center gap-1.5 sm:gap-2 glass-minimal px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/10 transition-all duration-200 hover:bg-white/7 hover:border-white/20"
      >
        <badge.icon className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400 group-hover:text-blue-400/90 transition-colors duration-200" />
        <span className="text-xs font-semibold tracking-wider uppercase text-white/80 group-hover:text-white/95 transition-colors duration-200">
          {badge.text}
        </span>
      </motion.div>
    ) : null;

  // Title: gradient on last word (hero), otherwise clean, bold, minimal - improved responsive typography
  const TitleComponent = () => {
    if (gradient && size === "hero") {
      // Use heading-main class from design system
      const words = title.trim().split(" ");
      const lastWord = words.pop();
      const firstWords = words.join(" ");
      return (
        <motion.h2
          variants={disableAnimation ? undefined : itemVariants}
          className="heading-main"
        >
          {firstWords && <span>{firstWords} </span>}
          <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400 bg-clip-text text-transparent">
            {lastWord}
          </span>
        </motion.h2>
      );
    }
    if (size === "large") {
      return (
        <motion.h2
          variants={disableAnimation ? undefined : itemVariants}
          className="headline-lg text-white"
        >
          {title}
        </motion.h2>
      );
    }
    return (
      <motion.h2
        variants={disableAnimation ? undefined : itemVariants}
        className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-white leading-tight tracking-tight px-2 sm:px-0"
      >
        {title}
      </motion.h2>
    );
  };

  // Subtitle: minimal, muted, max-w, clean - improved responsive design
  const SubtitleComponent = () =>
    subtitle ? (
      <motion.h3
        variants={disableAnimation ? undefined : itemVariants}
        className="body-base text-white/80 font-medium max-w-xl px-2 sm:px-0 text-sm sm:text-base md:text-lg"
      >
        {subtitle}
      </motion.h3>
    ) : null;

  // Description: muted, max-w, clean - improved responsive design
  const DescriptionComponent = () =>
    description ? (
      <motion.p
        variants={disableAnimation ? undefined : itemVariants}  
        className="text-white/65 max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-xl text-xs sm:text-sm md:text-base text-center px-2 sm:px-4 md:px-0 leading-relaxed"
      >
        {description}
      </motion.p>
    ) : null;

  // Stats: minimal, blue accent, subtle hover, consistent spacing - improved responsive grid
  const StatsComponent = () =>
    stats && stats.length > 0 ? (
      <motion.div
        variants={disableAnimation ? undefined : itemVariants}
        className="flex flex-wrap justify-center gap-2 xs:gap-3 sm:gap-4 lg:gap-5 px-2 sm:px-0"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            className="group flex items-center gap-1 xs:gap-1.5 text-white/65 hover:text-white transition-colors duration-200 px-1.5 xs:px-2 py-1 rounded-md hover:bg-white/5"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.15 }}
          >
            <stat.icon
              className={`h-3 w-3 xs:h-4 xs:w-4 ${stat.color || "text-blue-400/90"} transition-colors duration-200`}
            />
            <span className="text-xs font-medium whitespace-nowrap">{stat.text}</span>
          </motion.div>
        ))}
      </motion.div>
    ) : null;

  // UseCases: minimal, multi-row, dot divider, blue accent, Lucide icon, subtle - improved responsive layout
  const UseCasesComponent = () => {
    if (!useCases || useCases.length === 0) return null;

    // Animation for fade-in
    const useCasesVariants: Variants = {
      hidden: { opacity: 0, y: 8 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.32,
          ease: easeCubicBezier,
        },
      },
    };

    return (
      <motion.div
        variants={disableAnimation ? undefined : itemVariants}
        className="w-full flex justify-center px-2 sm:px-0"
      >
        <motion.div
          variants={disableAnimation ? undefined : useCasesVariants}
          initial={disableAnimation ? undefined : "hidden"}
          whileInView={disableAnimation ? undefined : "visible"}
          viewport={disableAnimation ? undefined : { once: true, margin: "-36px" }}
          className="flex flex-col xs:flex-row flex-wrap items-center justify-center gap-x-0 gap-y-2 xs:gap-y-1 sm:gap-x-2 md:gap-x-3 lg:gap-x-4 w-full max-w-xs xs:max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-3xl"
        >
          {useCases.map((useCase, idx) => (
            <div
              key={idx}
              className="flex items-center justify-center xs:justify-start w-full xs:w-auto min-w-0"
            >
              <div className="flex items-center min-w-0 flex-shrink-0">
                <span className="flex items-center justify-center rounded-full bg-blue-600/10 border border-blue-600/20 w-5 h-5 xs:w-6 xs:h-6 mr-1.5 xs:mr-2 flex-shrink-0">
                  <CheckCircle className="w-3 h-3 xs:w-4 xs:h-4 text-blue-400" strokeWidth={2} />
                </span>
                <span className="text-white/70 text-xs xs:text-sm font-normal truncate">
                  {useCase}
                </span>
              </div>
              {idx < useCases.length - 1 && (
                <span
                  className="mx-2 xs:mx-3 text-white/20 select-none hidden xs:inline"
                  aria-hidden="true"
                >
                  &bull;
                </span>
              )}
            </div>
          ))}
        </motion.div>
      </motion.div>
    );
  };

  // Container: minimal, modern, consistent spacing, no large gaps - improved responsive spacing
  const Container = motion.div;
  const containerProps = disableAnimation
    ? {
        className: `flex flex-col ${alignmentClasses} gap-2 xs:gap-2.5 sm:gap-3 md:gap-4 w-full ${className}`,
      }
    : {
        className: `flex flex-col ${alignmentClasses} gap-2 xs:gap-2.5 sm:gap-3 md:gap-4 w-full ${className}`,
        variants: containerVariants,
        initial: "hidden",
        whileInView: "visible",
        viewport: { once: true, margin: "-28px" },
      };

  return (
    <Container {...containerProps}>
      {badge && <BadgeComponent />}

      <div className="flex flex-col gap-1 xs:gap-1.5 sm:gap-2 items-center w-full">
        <TitleComponent />
        <SubtitleComponent />
        <DescriptionComponent />
      </div>

      <StatsComponent />
      <UseCasesComponent />
    </Container>
  );
};

export default SectionHeader;
