"use client";

import { useState, useEffect } from "react";
import { CheckCircle, X, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface SuccessModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  title: string;
  message: string;
  boardId?: string;
  boardName?: string;
  isMobile?: boolean;
  isTablet?: boolean;
}

export default function SuccessModal({
  isOpen,
  onCloseAction,
  title,
  message,
  boardId,
  boardName,
  isMobile,
  isTablet,
}: SuccessModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
      // Trigger confetti briefly on open, respecting reduced motion
      const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!reduced) {
        setShowConfetti(true);
        const t = setTimeout(() => setShowConfetti(false), 2500);
        return () => clearTimeout(t);
      }
    } else {
      document.body.style.overflow = "unset";
      setTimeout(() => setIsVisible(false), 300);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;

  const handleNavigateToBoard = () => {
    if (boardId) {
      router.push(`/board/${boardId}`);
    }
    onCloseAction();
  };

  return (
    <div className="fixed inset-0 z-[10000] flex min-h-[100vh] items-center justify-center">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[1050] bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onCloseAction}
      />

      {/* Modal container */}
      <div className={`fixed inset-0 z-[1060] flex items-center justify-center ${isMobile || isTablet ? 'p-2' : 'p-4'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-modal-title"
      >
        <div
          className={`relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#111111] shadow-2xl transform transition-all duration-300 ${
            isMobile ? 'max-w-xs max-h-[85vh]' : isTablet ? 'max-w-sm max-h-[80vh]' : 'max-w-md max-h-[80vh]'
          } ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Confetti Canvas */}
          {showConfetti && <ConfettiCanvas />}

          {/* Header */}
          <div className={`flex items-center justify-between px-5 ${isMobile ? 'py-4' : 'py-5'} border-b border-white/10`}>
            <div className="flex items-center gap-3">
              <div className="inline-flex p-2 rounded-xl bg-white/10 border border-white/15" aria-hidden="true">
                <CheckCircle className="w-5 h-5 text-emerald-300" />
              </div>
              <h2 id="success-modal-title" className={`text-white font-semibold ${isMobile ? 'text-base' : 'text-lg'}`}>{title}</h2>
            </div>
            <button
              onClick={onCloseAction}
              className={`w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 grid place-items-center transition-colors ${isMobile ? 'touch-manipulation' : ''}`}
              aria-label="Close modal"
            >
              <X className="w-4 h-4 text-white/80" />
            </button>
          </div>

          {/* Content */}
          <div className={`flex-1 space-y-6 text-center overflow-y-auto ${isMobile ? 'p-4' : 'p-6'}`}>
            <div className={`relative ${isMobile ? 'mb-2' : 'mb-4'}`}>
              <div className={`mx-auto flex items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30 ${isMobile ? 'h-16 w-16' : 'h-20 w-20'}`}>
                <CheckCircle className={`text-emerald-300 ${isMobile ? 'h-8 w-8' : 'h-10 w-10'}`} />
              </div>
              <div className={`absolute inset-0 mx-auto rounded-full animate-ping bg-emerald-500 opacity-10 ${isMobile ? 'h-16 w-16' : 'h-20 w-20'}`} />
            </div>
            <p className={`leading-relaxed text-white/70 ${isMobile ? 'text-sm' : 'text-base'}`}>{message}</p>
            {boardName && (
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5">
                <div className="mb-3 text-white/80 font-semibold">Board Ready</div>
                <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3 text-left">
                  <div className="mb-1 text-xs text-white/50">Board Name</div>
                  <div className="text-sm font-semibold text-white break-words">“{boardName}”</div>
                </div>
              </div>
            )}
            <div className={`flex gap-3 ${isMobile ? 'flex-col' : 'flex-col sm:flex-row'}`}>
              {boardId && (
                <button
                  onClick={handleNavigateToBoard}
                  className={`group flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold transition-colors ${isMobile ? 'px-4 py-3 min-h-[44px]' : 'px-6 py-3'}`}
                >
                  <span>Open Board</span>
                  <ArrowRight className={`transition-transform duration-200 group-hover:translate-x-1 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                </button>
              )}
              <button
                onClick={onCloseAction}
                className={`flex-1 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold transition-colors ${isMobile ? 'px-4 py-3 min-h-[44px]' : 'px-6 py-3'}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Lightweight confetti using canvas; automatically cleans up on unmount
function ConfettiCanvas() {
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '1';

    const parent = document.body;
    parent.appendChild(canvas);

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };
    resize();

    const pieces = Array.from({ length: 140 }).map(() => ({
      x: Math.random() * canvas.width,
      y: -Math.random() * canvas.height * 0.5,
      r: 3 + Math.random() * 4,
      vy: 1 + Math.random() * 2,
      vx: -1 + Math.random() * 2,
      rot: Math.random() * Math.PI,
      vr: -0.05 + Math.random() * 0.1,
      color: randomConfettiColor(),
    }));

    let raf = 0;
    const render = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of pieces) {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        if (p.y - 10 > canvas.height) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
        drawRect(ctx, p.x, p.y, p.r * 2, p.r, p.rot, p.color);
      }
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    window.addEventListener('resize', resize);
    const stopTimeout = setTimeout(() => {
      cancelAnimationFrame(raf);
      canvas.remove();
      window.removeEventListener('resize', resize);
    }, 2500);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(stopTimeout);
      window.removeEventListener('resize', resize);
      canvas.remove();
    };
  }, []);

  return null;
}

function drawRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, rot: number, color: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = color;
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.restore();
}

function randomConfettiColor(): string {
  const palette = [
    'rgba(59, 130, 246, 0.9)',   // blue-500
    'rgba(37, 99, 235, 0.9)',    // blue-600
    'rgba(16, 185, 129, 0.9)',   // emerald-500
    'rgba(245, 158, 11, 0.9)',   // amber-500
    'rgba(239, 68, 68, 0.9)',    // red-500
  ];
  return palette[(Math.random() * palette.length) | 0];
}
