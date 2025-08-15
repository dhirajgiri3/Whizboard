"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion, Variants } from "framer-motion";
import { X, Maximize, Minimize, ExternalLink, Gauge, Volume2, VolumeX, Eye, EyeOff } from "lucide-react";

interface DemoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title?: string;
  description?: string;
}

export default function DemoVideoModal({ isOpen, onClose, videoUrl, title = "Watch 3‑Min Demo", description = "A quick tour of Whizboard's realtime whiteboard, collaboration, and pro features." }: DemoVideoModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Open/close animations and scroll lock
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
      // Focus video element for immediate keyboard accessibility
      setTimeout(() => videoRef.current?.focus({ preventScroll: true }), 0);
    } else {
      document.body.style.overflow = "unset";
      const t = setTimeout(() => setIsVisible(false), 240);
      return () => clearTimeout(t);
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  // Track fullscreen changes to keep state in sync
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key.toLowerCase() === "f") toggleFullscreen();
      if (e.key.toLowerCase() === "m") toggleMute();
      if (e.key === "," || e.key === "<") updatePlaybackRate(Math.max(0.5, playbackRate - 0.25));
      if (e.key === "." || e.key === ">") updatePlaybackRate(Math.min(2, playbackRate + 0.25));
      if (e.key === " " || e.key.toLowerCase() === "k") togglePlayPause();
      if (e.key === "ArrowLeft") seekBy(-5);
      if (e.key === "ArrowRight") seekBy(5);
      if (e.key.toLowerCase() === "c") setShowControls(prev => !prev);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, playbackRate]);

  const playbackOptions = useMemo(() => [0.75, 1, 1.25, 1.5, 2], []);

  const updatePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) videoRef.current.playbackRate = rate;
  };

  const toggleFullscreen = () => {
    const el = videoRef.current;
    if (!el) return;
    const doc: any = document;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      doc.exitFullscreen?.();
    }
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
    if (videoRef.current) videoRef.current.muted = !isMuted;
  };

  const togglePlayPause = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play(); else v.pause();
  };

  const seekBy = (seconds: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min((v.duration || 0), v.currentTime + seconds));
  };

  const toggleControls = () => {
    setShowControls(prev => !prev);
  };

  if (!isOpen && !isVisible) return null;

  const backdropVariants: Variants = {
    hidden: { opacity: prefersReducedMotion ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: { duration: prefersReducedMotion ? 0 : 0.12, ease: [0.25, 0.46, 0.45, 0.94] }
    },
    exit: { opacity: prefersReducedMotion ? 1 : 0, transition: { duration: prefersReducedMotion ? 0 : 0.1 } }
  };

  const modalVariants: Variants = {
    hidden: { opacity: prefersReducedMotion ? 1 : 0, scale: prefersReducedMotion ? 1 : 0.98, y: prefersReducedMotion ? 0 : 8 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0 : 0.15, ease: [0.25, 0.46, 0.45, 0.94] }
    },
    exit: { opacity: prefersReducedMotion ? 1 : 0, scale: prefersReducedMotion ? 1 : 0.98, y: prefersReducedMotion ? 0 : 8, transition: { duration: prefersReducedMotion ? 0 : 0.12 } }
  };

  const controlsVariants: Variants = {
    hidden: { opacity: 0, y: -8 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }
    },
    exit: { 
      opacity: 0, 
      y: -8,
      transition: { duration: 0.1, ease: [0.55, 0.055, 0.675, 0.19] }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1050] h-screen w-screen">
          {/* Backdrop */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={backdropVariants}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />

          {/* Modal shell - Full screen with padding */}
          <div className="fixed inset-0 z-[1060] flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={modalVariants}
              className="relative w-full h-full max-w-7xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 bg-[#111111] shadow-2xl shadow-blue-600/10"
              role="dialog"
              aria-modal="true"
              aria-labelledby="demo-video-title"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Subtle gradient orb for depth */}
              <div className="pointer-events-none absolute -top-28 -right-20 h-52 w-52 rounded-full" style={{ background: "radial-gradient(circle, rgba(37,99,235,0.25) 0%, rgba(37,99,235,0.08) 50%, transparent 70%)", filter: "blur(40px)" }} />

              {/* Header - Always visible */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="inline-flex p-2 rounded-xl bg-white/10 border border-white/15" aria-hidden="true">
                    <Gauge className="h-5 w-5 text-blue-300" />
                  </div>
                  <div className="min-w-0">
                    <h2 id="demo-video-title" className="text-white font-semibold text-base sm:text-lg truncate">{title}</h2>
                    <p className="text-white/70 text-xs sm:text-sm truncate">{description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 text-xs text-white/90 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-black"
                    aria-label="Open demo in new tab"
                  >
                    <ExternalLink className="h-4 w-4" /> Open
                  </a>
                  <button
                    onClick={onClose}
                    className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 grid place-items-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-black"
                    aria-label="Close modal"
                  >
                    <X className="h-4 w-4 text-white/90" />
                  </button>
                </div>
              </div>

              {/* Video area - Centered and responsive */}
              <div className="relative flex-1 flex items-center justify-center">
                <div className="relative w-full h-full max-w-6xl max-h-full bg-black">
                  <video
                    ref={videoRef}
                    className="h-full w-full object-contain focus:outline-none"
                    src={videoUrl}
                    controls
                    playsInline
                    preload="metadata"
                    poster=""
                    muted={isMuted}
                  />

                  {/* Main toggle button - Always visible, shows only icon when controls are hidden */}
                  <div className="absolute top-4 left-4">
                    <button
                      onClick={toggleControls}
                      className="inline-flex items-center gap-2 rounded-lg bg-black/80 hover:bg-black/90 border border-white/20 px-3 py-1.5 text-xs text-white font-medium transition-colors backdrop-blur-md shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-black"
                      aria-label={showControls ? "Hide video controls" : "Show video controls"}
                    >
                      {showControls ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      {showControls && <span className="hidden md:inline">Hide Controls</span>}
                    </button>
                  </div>

                  {/* Overlay controls with improved contrast - Only these are toggled */}
                  <AnimatePresence>
                    {showControls && (
                      <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={controlsVariants}
                        className="absolute top-4 right-4 flex items-center gap-2"
                      >
                        <div className="hidden sm:flex items-center gap-1 rounded-lg bg-black/80 border border-white/20 p-1 backdrop-blur-md shadow-lg">
                          {playbackOptions.map((rate) => (
                            <button
                              key={rate}
                              onClick={() => updatePlaybackRate(rate)}
                              className={`px-2.5 py-1 text-xs rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-black ${rate === playbackRate ? "bg-white/25 text-white font-medium" : "text-white/90 hover:bg-white/20"}`}
                              aria-label={`Set playback to ${rate}x`}
                            >
                              {rate}x
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={toggleMute}
                          className="inline-flex items-center gap-2 rounded-lg bg-black/80 hover:bg-black/90 border border-white/20 px-3 py-1.5 text-xs text-white font-medium transition-colors backdrop-blur-md shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-black"
                          aria-label={isMuted ? "Unmute" : "Mute"}
                        >
                          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                          <span className="hidden md:inline">{isMuted ? "Muted" : "Sound"}</span>
                        </button>
                        <button
                          onClick={toggleFullscreen}
                          className="inline-flex items-center gap-2 rounded-lg bg-black/80 hover:bg-black/90 border border-white/20 px-3 py-1.5 text-xs text-white font-medium transition-colors backdrop-blur-md shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-black"
                          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                        >
                          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                          <span className="hidden md:inline">{isFullscreen ? "Exit" : "Fullscreen"}</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
