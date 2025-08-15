"use client";

import React, { createContext, useContext, useState } from "react";
import DemoVideoModal from "./DemoVideoModal";

interface DemoModalContextType {
  openDemo: () => void;
  closeDemo: () => void;
  isOpen: boolean;
}

const DemoModalContext = createContext<DemoModalContextType | undefined>(undefined);

export const useDemoModal = () => {
  const context = useContext(DemoModalContext);
  if (!context) {
    throw new Error("useDemoModal must be used within a DemoModalProvider");
  }
  return context;
};

interface DemoModalProviderProps {
  children: React.ReactNode;
  videoUrl?: string;
  title?: string;
  description?: string;
}

export const DemoModalProvider = ({
  children,
  videoUrl = "https://res.cloudinary.com/dgak25skk/video/upload/v1755180328/whizboard-3_qyofjn.mp4",
  title = "Watch 3‑Min Demo",
  description = "See how Whizboard enables fluid realtime collaboration.",
}: DemoModalProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const openDemo = () => setIsOpen(true);
  const closeDemo = () => setIsOpen(false);

  return (
    <DemoModalContext.Provider value={{ openDemo, closeDemo, isOpen }}>
      {children}
      <DemoVideoModal
        isOpen={isOpen}
        onClose={closeDemo}
        videoUrl={videoUrl}
        title={title}
        description={description}
      />
    </DemoModalContext.Provider>
  );
};
