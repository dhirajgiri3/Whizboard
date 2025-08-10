"use client";

import React from "react";
import { motion } from "framer-motion";
import BackButton, { BackButtonProps } from "./BackButton";

type BackButtonContainerProps = {
  children?: React.ReactNode;
  className?: string;
  variant?: BackButtonProps["variant"];
  position?: BackButtonProps["position"];
  showLabel?: boolean;
  size?: BackButtonProps["size"];
  label?: string;
  fallbackHref?: string;
  disabled?: boolean;
  onBack?: BackButtonProps["onBack"];
  // Container specific props
  containerVariant?: "page" | "modal" | "overlay" | "minimal";
  spacing?: "none" | "sm" | "md" | "lg";
  align?: "left" | "center" | "right";
};

export default function BackButtonContainer({
  children,
  className = "",
  variant = "light",
  position = "relative",
  showLabel = true,
  size = "md",
  label = "Back",
  fallbackHref = "/",
  disabled = false,
  onBack,
  containerVariant = "page",
  spacing = "md",
  align = "left",
}: BackButtonContainerProps) {
  // Container variants with different layouts
  const containerVariants = {
    page: "pt-16 sm:pt-20", // Account for fixed header
    modal: "pt-4",
    overlay: "pt-2",
    minimal: "pt-2",
  };

  // Spacing variants
  const spacingVariants = {
    none: "",
    sm: "mb-4",
    md: "mb-6",
    lg: "mb-8",
  };

  // Alignment variants
  const alignVariants = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

  // Determine if we need to account for header
  const needsHeaderSpacing = containerVariant === "page" && position !== "fixed";

  const containerClasses = `
    ${containerVariants[containerVariant]}
    ${spacingVariants[spacing]}
    ${className}
  `;

  const buttonContainerClasses = `
    flex ${alignVariants[align]}
    ${needsHeaderSpacing ? "pt-16 sm:pt-20" : ""}
  `;

  return (
    <motion.div
      className={containerClasses}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className={buttonContainerClasses}>
        <BackButton
          variant={variant}
          position={position}
          showLabel={showLabel}
          size={size}
          label={label}
          fallbackHref={fallbackHref}
          disabled={disabled}
          onBack={onBack}
        />
      </div>
      {children}
    </motion.div>
  );
}

// Convenience components for common use cases
export function PageBackButton(props: Omit<BackButtonContainerProps, "containerVariant">) {
  return <BackButtonContainer {...props} containerVariant="page" />;
}

export function ModalBackButton(props: Omit<BackButtonContainerProps, "containerVariant">) {
  return <BackButtonContainer {...props} containerVariant="modal" />;
}

export function OverlayBackButton(props: Omit<BackButtonContainerProps, "containerVariant">) {
  return <BackButtonContainer {...props} containerVariant="overlay" />;
}

export function MinimalBackButton(props: Omit<BackButtonContainerProps, "containerVariant">) {
  return <BackButtonContainer {...props} containerVariant="minimal" />;
}
