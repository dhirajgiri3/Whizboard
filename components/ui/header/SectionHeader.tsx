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
  default: "text-2xl sm:text-3xl md:text-4xl font-semibold", // fallback
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
  // Alignment classes
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

  // Badge: minimal, glass, blue accent, subtle hover
  const BadgeComponent = () =>
    badge ? (
      <motion.div
        variants={disableAnimation ? undefined : itemVariants}
        className="group inline-flex items-center gap-2 glass-minimal px-3 py-1.5 rounded-full border border-white/10 transition-all duration-200 hover:bg-white/7 hover:border-white/20"
      >
        <badge.icon className="h-4 w-4 text-blue-400 group-hover:text-blue-400/90 transition-colors duration-200" />
        <span className="text-xs font-semibold tracking-wider uppercase text-white/80 group-hover:text-white/95 transition-colors duration-200">
          {badge.text}
        </span>
      </motion.div>
    ) : null;

  // Title: gradient on last word (hero), otherwise clean, bold, minimal
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
        className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white"
      >
        {title}
      </motion.h2>
    );
  };

  // Subtitle: minimal, muted, max-w, clean
  const SubtitleComponent = () =>
    subtitle ? (
      <motion.h3
        variants={disableAnimation ? undefined : itemVariants}
        className="body-base text-white/80 font-medium max-w-xl"
      >
        {subtitle}
      </motion.h3>
    ) : null;

  // Description: muted, max-w, clean
  const DescriptionComponent = () =>
    description ? (
      <motion.p
        variants={disableAnimation ? undefined : itemVariants}  
        className="text-white/65 max-w-lg text-sm sm:text-base text-center"
      >
        {description}
      </motion.p>
    ) : null;

  // Stats: minimal, blue accent, subtle hover, consistent spacing
  const StatsComponent = () =>
    stats && stats.length > 0 ? (
      <motion.div
        variants={disableAnimation ? undefined : itemVariants}
        className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-5"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            className="group flex items-center gap-1.5 text-white/65 hover:text-white transition-colors duration-200 px-2 py-1 rounded-md hover:bg-white/5"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.15 }}
          >
            <stat.icon
              className={`h-4 w-4 ${stat.color || "text-blue-400/90"} transition-colors duration-200`}
            />
            <span className="text-xs font-medium">{stat.text}</span>
          </motion.div>
        ))}
      </motion.div>
    ) : null;

  // UseCases: minimal, multi-row, dot divider, blue accent, Lucide icon, subtle
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
        className="w-full flex justify-center"
      >
        <motion.ul
          variants={disableAnimation ? undefined : useCasesVariants}
          initial={disableAnimation ? undefined : "hidden"}
          whileInView={disableAnimation ? undefined : "visible"}
          viewport={disableAnimation ? undefined : { once: true, margin: "-36px" }}
          className="flex flex-row flex-wrap items-center justify-center gap-x-0 gap-y-2 sm:gap-x-2 md:gap-x-4 lg:gap-x-6 w-full max-w-3xl"
          style={{ listStyle: "none", padding: 0, margin: 0 }}
        >
          {useCases.map((useCase, idx) => (
            <li
              key={idx}
              className="flex items-center min-w-0"
            >
              <span className="flex items-center justify-center rounded-full bg-blue-600/10 border border-blue-600/20 w-6 h-6 mr-2">
                <CheckCircle className="w-4 h-4 text-blue-400" strokeWidth={2} />
              </span>
              <span className="text-white/70 text-sm font-normal truncate">
                {useCase}
              </span>
              {idx < useCases.length - 1 && (
                <span
                  className="mx-3 text-white/20 select-none"
                  aria-hidden="true"
                >
                  &bull;
                </span>
              )}
            </li>
          ))}
        </motion.ul>
      </motion.div>
    );
  };

  // Container: minimal, modern, consistent spacing, no large gaps
  const Container = motion.div;
  const containerProps = disableAnimation
    ? {
        className: `flex flex-col ${alignmentClasses} gap-2 sm:gap-3 lg:gap-4 ${className}`,
      }
    : {
        className: `flex flex-col ${alignmentClasses} gap-2 sm:gap-3 lg:gap-4 ${className}`,
        variants: containerVariants,
        initial: "hidden",
        whileInView: "visible",
        viewport: { once: true, margin: "-28px" },
      };

  return (
    <Container {...containerProps}>
      {badge && <BadgeComponent />}

      <div className="flex flex-col gap-1 sm:gap-1.5 items-center">
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
