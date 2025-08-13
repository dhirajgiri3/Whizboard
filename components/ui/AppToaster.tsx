"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      theme="dark"
      position="top-center"
      richColors
      closeButton
      duration={3500}
      toastOptions={{
        classNames: {
          toast:
            "group relative rounded-2xl bg-[#171717] border border-white/10 shadow-glow backdrop-blur-sm text-white/90 px-4 py-3 md:px-5 md:py-4 pr-12",
          title: "text-white font-semibold tracking-[-0.01em] mb-0.5",
          description: "text-white/70 text-sm leading-relaxed",
          icon: "text-blue-400",
          actionButton:
            "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 border border-blue-600/80 text-white",
          cancelButton:
            "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-white/90",
          closeButton:
            "absolute right-2 top-2 z-10 w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors",
        },
        style: {
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        },
      }}
    />
  );
}

export default AppToaster;


