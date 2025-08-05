import { useState, useEffect } from 'react';

export const useHeaderTheme = () => {
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroElement = document.getElementById('hero');
      if (!heroElement) {
        setIsLightMode(false);
        return;
      }

      const heroRect = heroElement.getBoundingClientRect();
      const headerHeight = 80; // Approximate header height

      // Check if header is over the hero section
      const isOverHero = heroRect.top <= headerHeight && heroRect.bottom >= headerHeight;
      setIsLightMode(isOverHero);
    };

    // Initial check
    handleScroll();

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return { isLightMode };
}; 