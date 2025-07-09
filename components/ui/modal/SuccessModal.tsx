"use client";

import { useState, useEffect } from "react";
import { CheckCircle, X, ArrowRight, Palette, Sparkles } from "lucide-react";
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
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
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
    <div className="fixed inset-0 z-[10000] flex min-h-[100vh] items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className={`relative flex w-full flex-col rounded-3xl border border-white/20 bg-white/95 shadow-2xl backdrop-blur-xl transition-all duration-300 ${
          isMobile 
            ? "mx-2 max-w-xs h-[85vh] max-h-[500px]" 
            : isTablet 
              ? "mx-4 max-w-sm h-[80vh] max-h-[600px]" 
              : "mx-4 max-w-md sm:mx-8"
        } ${isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between border-b border-gray-100 ${isMobile ? "p-4" : "p-6"}`}>
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-green-600 shadow-lg ${isMobile ? "h-8 w-8" : "h-10 w-10"}`}>
              <CheckCircle className={`text-white ${isMobile ? "h-4 w-4" : "h-5 w-5"}`} />
            </div>
            <h2 className={`font-bold text-gray-900 ${isMobile ? "text-lg" : "text-xl"}`}>{title}</h2>
          </div>
          <button
            onClick={onCloseAction}
            className={`rounded-xl transition-colors duration-200 hover:bg-gray-100 ${isMobile ? "p-1.5 min-h-[44px] min-w-[44px]" : "p-2"}`}
            aria-label="Close modal"
          >
            <X className={`text-gray-600 ${isMobile ? "h-4 w-4" : "h-5 w-5"}`} />
          </button>
        </div>
        <div className={`flex-1 space-y-6 text-center overflow-y-auto ${isMobile ? "p-4" : "p-6"}`}>
          <div className={`relative ${isMobile ? "mb-4" : "mb-8"}`}>
            <div className={`mx-auto flex items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-2xl animate-bounce ${isMobile ? "h-16 w-16" : "h-24 w-24"}`}>
              <CheckCircle className={`text-white ${isMobile ? "h-8 w-8" : "h-12 w-12"}`} />
            </div>
            <div className="absolute -right-3 -top-3 animate-pulse text-yellow-400">
              <Sparkles className="h-8 w-8" />
            </div>
            <div className="absolute -bottom-3 -left-3 animate-pulse text-blue-400 animation-delay-1000">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className={`absolute inset-0 mx-auto animate-ping rounded-full bg-green-400 opacity-20 ${isMobile ? "h-16 w-16" : "h-24 w-24"}`}></div>
          </div>
          <p className={`leading-relaxed text-slate-600 ${isMobile ? "text-sm" : "text-base"}`}>{message}</p>
          {boardName && (
            <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50 p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                  <Palette className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-semibold text-slate-800">
                  Board Ready!
                </span>
              </div>
              <div className="rounded-xl border border-blue-100 bg-white/70 p-3">
                <div className="mb-1 text-sm text-slate-500">Board Name:</div>
                <div className="text-base font-semibold text-slate-800">
                  “{boardName}”
                </div>
              </div>
            </div>
          )}
          <div className={`flex gap-4 ${isMobile ? "flex-col" : "flex-col sm:flex-row"}`}>
            {boardId && (
              <button
                onClick={handleNavigateToBoard}
                className={`group flex flex-1 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${isMobile ? "px-4 py-3 min-h-[44px]" : "px-8 py-4"}`}
              >
                <Palette className={`${isMobile ? "h-4 w-4" : "h-5 w-5"}`} />
                <span className="whitespace-nowrap">Start Creating</span>
                <ArrowRight className={`transition-transform duration-300 group-hover:translate-x-1 ${isMobile ? "h-4 w-4" : "h-5 w-5"}`} />
              </button>
            )}
            <button
              onClick={onCloseAction}
              className={`flex-1 rounded-xl border border-slate-200 bg-slate-100 font-semibold text-slate-700 transition-all duration-300 hover:bg-slate-200 hover:border-slate-300 ${isMobile ? "px-4 py-3 min-h-[44px]" : "px-8 py-4"}`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
      <style jsx>{`
        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
