"use client";

type HelpToggleButtonProps = {
  isVisible: boolean;
  isMobile: boolean;
  isTablet: boolean;
  onClick: () => void;
};

export default function HelpToggleButton({
  isVisible,
  isMobile,
  isTablet,
  onClick,
}: HelpToggleButtonProps) {
  if (!isVisible) return null;

  return (
    <button
      onClick={onClick}
      className={`
        fixed z-45 bg-slate-900/80 hover:bg-slate-800/90 h-12 w-12 flex items-center justify-center text-white rounded-full p-3 backdrop-blur-xl border border-slate-700/50 shadow-xl transition-all duration-300 hover:scale-110
        ${
          isMobile
            ? "bottom-[calc(env(safe-area-inset-bottom)+112px)] right-4"
            : isTablet
            ? "bottom-20 right-4"
            : "bottom-4 right-4 xl:bottom-4 xl:right-4"
        }
      `}
      title="Show keyboard shortcuts (?)"
    >
      <span className="text-lg">⌨️</span>
    </button>
  );
}


