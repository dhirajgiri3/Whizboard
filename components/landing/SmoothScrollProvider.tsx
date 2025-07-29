"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { useRouter } from "next/navigation";

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

const SmoothScrollProvider = ({ children }: SmoothScrollProviderProps) => {
  const lenisRef = useRef<Lenis | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Initialize Lenis smooth scrolling
    lenisRef.current = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      infinite: false, 
      lerp: 0.1,
      wheelMultiplier: 1,
      touchMultiplier: 1, 
    });

    // RAF loop for smooth animations
    function raf(time: number) {
      lenisRef.current?.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Handle route changes
    const handleRouteChange = () => {
      lenisRef.current?.scrollTo(0, { immediate: true });
    };

    // Cleanup
    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy();
      }
    };
  }, []);

  return <>{children}</>;
};

export default SmoothScrollProvider; 