import { useEffect, useState } from "react";

export const useBoardResponsive = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    // Prevent double-tap zoom on mobile
    const preventDoubleTapZoom = (e: TouchEvent) => {
      e.preventDefault();
    };

    if (isMobile) {
      document.addEventListener("touchend", preventDoubleTapZoom);
    }

    return () => {
      if (isMobile) {
        document.removeEventListener("touchend", preventDoubleTapZoom);
      }
    };
  }, [isMobile]);

  return {
    isMobile,
    isTablet,
  };
}; 