"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type BackButtonProps = {
  label?: string;
  fallbackHref?: string;
  className?: string;
  variant?: "light" | "dark";
};

export default function BackButton({
  label = "Back",
  fallbackHref = "/",
  className = "",
  variant = "light",
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  const baseStyles =
    "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors";
  const lightStyles =
    "text-slate-600 hover:text-slate-900 border border-slate-200 bg-white hover:bg-slate-50";
  const darkStyles =
    "text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10";
  const styles = `${baseStyles} ${variant === "dark" ? darkStyles : lightStyles}`;

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${styles} ${className}`}
      aria-label="Go back"
    >
      <ArrowLeft className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}


