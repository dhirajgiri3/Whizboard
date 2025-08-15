"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion, useMotionValue, useTransform } from "framer-motion";
import type { Easing } from "framer-motion";
import {
  Cloud,
  Share2,
  FileText,
  Image,
  Upload,
  Folder,
  MessageSquare,
  CheckCircle,
  ArrowRight,
  Link2,
} from "lucide-react";
import SectionHeader from "@/components/ui/header/SectionHeader";
import { LANDING_CONTENT } from "@/lib/landing-content";

const easeCubic: Easing = [0.4, 0, 0.2, 1];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: easeCubic },
  },
};

const glowVariants = {
  initial: { opacity: 0.0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: easeCubic },
  },
};

const pulseVariants = {
  animate: {
    scale: [1, 1.03, 1],
    opacity: [0.6, 0.8, 0.6],
    transition: { duration: 6, repeat: Infinity, ease: easeCubic },
  },
};

const pathVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 1.2, ease: easeCubic },
  },
};

const Bullet = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-start gap-2">
    <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5" />
    <span className="text-white/70 text-sm leading-relaxed">{children}</span>
  </div>
);

const CTA = ({ href, children, variant = "primary" as const, ariaLabel }: { href: string; children: React.ReactNode; variant?: "primary" | "ghost"; ariaLabel?: string }) => {
  const prefersReducedMotion = useReducedMotion();

  const baseClasses =
    "relative inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 min-h-[44px] font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900";

  const variantClasses =
    variant === "primary"
      ? "text-white bg-blue-600/95 hover:bg-blue-600 active:bg-blue-700 border border-white/10 shadow-[0_0_0_0_rgba(0,0,0,0)] hover:shadow-[0_0_20px_rgba(37,99,235,0.18)]"
      : "text-white/90 hover:text-white bg-white/[0.03] border border-white/[0.12] hover:border-white/[0.18]";

  return (
    <Link href={href} aria-label={ariaLabel} className={`${baseClasses} ${variantClasses}`}>
      {/* Subtle premium overlay */}
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-xl pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={prefersReducedMotion ? undefined : { opacity: 1 }}
        transition={{ duration: 0.25, ease: easeCubic }}
        style={{
          background:
            variant === "primary"
              ? "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.0) 60%)"
              : "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.0) 60%)",
        }}
      />
      <motion.span
        className="relative z-10 inline-flex items-center gap-2"
        whileHover={prefersReducedMotion ? undefined : { y: -1 }}
        whileTap={prefersReducedMotion ? undefined : { y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
      >
        {children}
      </motion.span>
    </Link>
  );
};

const InteractiveCard = ({
  children,
  className = "",
  variants,
}: {
  children: React.ReactNode;
  className?: string;
  variants?: any;
}) => {
  const prefersReducedMotion = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const spotlight = useTransform([mx, my], ([x, y]) => `radial-gradient(280px at ${x}px ${y}px, rgba(59,130,246,0.15), transparent 60%)`);

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - rect.left);
    my.set(e.clientY - rect.top);
  };

  return (
    <motion.div
      variants={variants}
      whileHover={prefersReducedMotion ? undefined : { y: -2 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      onPointerMove={prefersReducedMotion ? undefined : onPointerMove}
      className={`relative p-6 sm:p-8 rounded-3xl bg-black/[0.1] border border-white/[0.07] overflow-hidden transition-colors duration-300 backdrop-blur-sm ${className}`}
    >
      {/* Spotlight effect that follows mouse */}
      {!prefersReducedMotion && (
        <motion.div
          aria-hidden
          className="absolute inset-0 pointer-events-none rounded-3xl"
          style={{ backgroundImage: spotlight }}
        />
      )}
      
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.25, ease: easeCubic }}
        className="pointer-events-none absolute -inset-px rounded-3xl"
        style={{
          background:
            "radial-gradient(120% 120% at 50% -10%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 60%)",
        }}
      />
      <div className="relative z-10 space-y-4">{children}</div>
    </motion.div>
  );
};

const LogoBadge = ({ src, label }: { src: string; label: string }) => (
  <div className="inline-flex items-center gap-3 self-start mb-5">
    <div className="relative inline-flex p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
      <motion.img
        src={src}
        alt={label}
        className="h-6 w-6"
        initial={{ scale: 0.96, rotate: 0 }}
        whileHover={{ scale: 1.02, rotate: 1 }}
        transition={{ duration: 0.2, ease: easeCubic }}
      />
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-xl"
        style={{ boxShadow: "0 0 24px rgba(255,255,255,0.06) inset" }}
      />
    </div>
    <div>
      <h3 className="text-xl sm:text-2xl font-semibold text-white">{label}</h3>
      <p className="text-white/70 text-sm">{label === "Slack integration" ? "Bring updates into channels where your team already works." : "Export, organize, and reuse your boards and assets in Drive."}</p>
    </div>
  </div>
);

const Integrations = () => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <section className="section-padding flex flex-col items-center justify-center max-w-7xl mx-auto pb-20">
      <div className="container-base">
        <SectionHeader
          badge={{ icon: Link2, text: "Integrations" }}
          title="Work seamlessly with Slack and Google Drive"
          subtitle="Keep conversations flowing in Slack and keep files organized in Drive—without leaving Whizboard."
        />
        <div className="relative mt-10">
          {/* Background grid and orbs */}
          <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
          
          <motion.div
            variants={prefersReducedMotion ? undefined : glowVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.2 }}
            className="absolute -top-16 -left-20 w-56 h-56 sm:w-72 sm:h-72 gradient-orb-blue blur-2xl"
          />
          <motion.div
            variants={prefersReducedMotion ? undefined : pulseVariants}
            animate={prefersReducedMotion ? undefined : "animate"}
            className="absolute -bottom-12 -right-16 w-48 h-48 sm:w-64 sm:h-64 gradient-orb-neutral"
          />

          {/* Connecting path (animated) */}
          <motion.svg
            width="100%"
            height="220"
            viewBox="0 0 1200 220"
            className="hidden md:block absolute left-0 right-0 top-1/2 -translate-y-1/2"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.path
              id="connectorPath"
              d="M120 110 C 360 10, 840 210, 1080 110"
              fill="none"
              stroke="url(#grad)"
              strokeWidth="2"
              strokeDasharray="6 10"
              variants={pathVariants}
              animate={prefersReducedMotion ? undefined : { strokeDashoffset: [0, 80, 0] }}
              transition={prefersReducedMotion ? undefined : { duration: 6, repeat: Infinity, ease: "linear" }}
            />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(59,130,246,0.35)">
                  <animate attributeName="offset" values="0;1;0" dur="10s" repeatCount="indefinite" />
                </stop>
                <stop offset="100%" stopColor="rgba(96,165,250,0.9)" />
              </linearGradient>
            </defs>
            {!prefersReducedMotion && (
              <>
                <circle r="3" fill="rgba(96,165,250,0.95)">
                  <animateMotion dur="8s" begin="0s" repeatCount="indefinite" rotate="auto" path="M120 110 C 360 10, 840 210, 1080 110" />
                </circle>
                <circle r="3" fill="rgba(96,165,250,0.85)">
                  <animateMotion dur="8s" begin="2s" repeatCount="indefinite" rotate="auto" path="M120 110 C 360 10, 840 210, 1080 110" />
                </circle>
                <circle r="3" fill="rgba(96,165,250,0.85)">
                  <animateMotion dur="8s" begin="4s" repeatCount="indefinite" rotate="auto" path="M120 110 C 360 10, 840 210, 1080 110" />
                </circle>
              </>
            )}
          </motion.svg>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch"
          >
            {/* Slack Card */}
            <InteractiveCard variants={itemVariants}>
              <div className="absolute -top-20 -right-20 w-32 h-32 sm:w-40 sm:h-40 gradient-orb-blue opacity-70 group-hover:opacity-90 transition-opacity duration-300" />
              <div className="flex flex-col h-full min-h-[27rem] md:min-h-[28rem]">
                <LogoBadge src="/images/logos/slack.svg" label="Slack integration" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  <Bullet>Post updates to channels with one click</Bullet>
                  <Bullet>Share exports (PNG, PDF, JSON) directly to Slack</Bullet>
                  <Bullet>Use simple slash commands for quick actions</Bullet>
                  <Bullet>Auto-join channels when needed to deliver messages</Bullet>
                </div>

                {/* Animated chat bubbles */}
                <div className="relative mb-6">
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    animate={prefersReducedMotion ? undefined : { y: [0, -2, 0] }}
                    transition={{ duration: 0.35, ease: easeCubic, delay: 0.05, repeat: prefersReducedMotion ? 0 : Infinity, repeatType: "mirror", repeatDelay: 2.2 }}
                    viewport={{ once: true }}
                    className="w-[82%] max-w-md rounded-2xl bg-white/[0.06] border border-white/[0.12] p-3 backdrop-blur-sm mb-2"
                  >
                    <div className="flex items-center gap-2 text-white/80 text-sm">
                      <Share2 className="h-4 w-4 text-blue-300" />
                      <span>Board snapshot shared to #design-reviews</span>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    animate={prefersReducedMotion ? undefined : { y: [0, 2, 0] }}
                    transition={{ duration: 0.35, ease: easeCubic, delay: 0.18, repeat: prefersReducedMotion ? 0 : Infinity, repeatType: "mirror", repeatDelay: 2.6 }}
                    viewport={{ once: true }}
                    className="ml-auto w-[70%] max-w-sm rounded-2xl bg-white/[0.04] border border-white/[0.1] p-3 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-2 text-white/75 text-sm">
                      <MessageSquare className="h-4 w-4 text-white/50" />
                      <span>Looks great—approved</span>
                    </div>
                  </motion.div>
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-3">
                  <CTA href="/login" ariaLabel="Connect Slack">
                    <span className="inline-flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      {LANDING_CONTENT.ctaButtons.integrations}
                    </span>
                  </CTA>
                  <CTA href="/help" variant="ghost" ariaLabel="Learn more about Slack integration">
                    {LANDING_CONTENT.ctaButtons.learn}
                  </CTA>
                </div>
              </div>
            </InteractiveCard>

            {/* Google Drive Card */}
            <InteractiveCard variants={itemVariants}>
              <div className="absolute -top-24 -left-24 w-36 h-36 sm:w-48 sm:h-48 gradient-orb-neutral opacity-70 group-hover:opacity-90 transition-opacity duration-300" />
              <div className="flex flex-col h-full min-h-[27rem] md:min-h-[28rem]">
                <LogoBadge src="/images/logos/google-drive.svg" label="Google Drive integration" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  <Bullet>Export boards to a selected Drive folder</Bullet>
                  <Bullet>Import images and assets from Drive into boards</Bullet>
                  <Bullet>Manage files and folders from Whizboard</Bullet>
                  <Bullet>Secure access with Drive file scope</Bullet>
                </div>

                {/* Animated file tiles */}
                <div className="relative h-28 sm:h-32 mb-6">
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    animate={prefersReducedMotion ? undefined : { y: [0, -2, 0] }}
                    transition={{ duration: 0.35, ease: easeCubic, delay: 0.06, repeat: prefersReducedMotion ? 0 : Infinity, repeatType: "mirror", repeatDelay: 2.4 }}
                    viewport={{ once: true }}
                    className="absolute left-0 top-0 w-32 h-20 rounded-xl bg-white/[0.06] border border-white/[0.12] backdrop-blur-sm flex items-center justify-center gap-2"
                  >
                    <Image className="w-4 h-4 text-blue-300" />
                    <span className="text-xs text-white/75">Board.png</span>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    animate={prefersReducedMotion ? undefined : { y: [0, 2, 0] }}
                    transition={{ duration: 0.35, ease: easeCubic, delay: 0.18, repeat: prefersReducedMotion ? 0 : Infinity, repeatType: "mirror", repeatDelay: 2.8 }}
                    viewport={{ once: true }}
                    className="absolute left-28 top-8 w-36 h-20 rounded-xl bg-white/[0.04] border border-white/[0.1] backdrop-blur-sm flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-white/60" />
                    <span className="text-xs text-white/70">Notes.pdf</span>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    animate={prefersReducedMotion ? undefined : { y: [0, -1, 0] }}
                    transition={{ duration: 0.35, ease: easeCubic, delay: 0.28, repeat: prefersReducedMotion ? 0 : Infinity, repeatType: "mirror", repeatDelay: 3.0 }}
                    viewport={{ once: true }}
                    className="absolute left-56 top-2 w-28 h-20 rounded-xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm hidden sm:flex items-center justify-center gap-2"
                  >
                    <Folder className="w-4 h-4 text-white/50" />
                    <span className="text-xs text-white/60">Whizboard</span>
                  </motion.div>
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-3">
                  <CTA href="/login" ariaLabel="Connect Google Drive">
                    <span className="inline-flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      {LANDING_CONTENT.ctaButtons.integrations}
                    </span>
                  </CTA>
                  <CTA href="/help" variant="ghost" ariaLabel="Open Google Drive dashboard">
                    {LANDING_CONTENT.ctaButtons.learn}
                  </CTA>
                </div>
              </div>
            </InteractiveCard>
          </motion.div>
        </div>

        {/* Value reinforcement row */}
        <div className="mt-10 sm:mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.3, ease: easeCubic, delay: 0.02 }}
              viewport={{ once: true }}
              className="group flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12] transition-colors"
            >
              <MessageSquare className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-white/70">Faster reviews in team channels</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.3, ease: easeCubic, delay: 0.08 }}
              viewport={{ once: true }}
              className="group flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12] transition-colors"
            >
              <Cloud className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-white/70">Single source of truth for exports</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.3, ease: easeCubic, delay: 0.14 }}
              viewport={{ once: true }}
              className="group flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12] transition-colors"
            >
              <Upload className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-white/70">Less context switching, more flow</span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Integrations;
