import { useState, useEffect, useCallback, useRef } from 'react';

export const useHeaderTheme = () => {
  const [isLightMode, setIsLightMode] = useState(false);
  const [debouncedIsLightMode, setDebouncedIsLightMode] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollY = useRef(0);

  const checkTheme = useCallback(() => {
    try {
      const heroElement = document.getElementById('hero');
      
      // If no hero element exists, default to dark mode
      if (!heroElement) {
        setIsLightMode(false);
        return;
      }

      const heroRect = heroElement.getBoundingClientRect();
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Calculate the hero element's position relative to viewport
      const heroTop = heroRect.top;
      const heroBottom = heroRect.bottom;
      const heroHeight = heroRect.height;
      
      // Define the threshold for theme switching (more generous than before)
      const themeSwitchThreshold = Math.min(heroHeight * 0.3, 200); // 30% of hero height or 200px, whichever is smaller
      
      // Check if we're in the light mode zone
      // Light mode when:
      // 1. We're near the top of the page (within threshold)
      // 2. Hero element is still significantly visible in viewport
      const isNearTop = scrollY <= themeSwitchThreshold;
      const isHeroSignificantlyVisible = heroBottom > windowHeight * 0.2; // Hero is more than 20% visible
      
      // Add some hysteresis to prevent flickering
      // Only change theme if scroll direction is consistent or we're at the extremes
      const scrollDirection = scrollY > lastScrollY.current ? 'down' : 'up';
      const isAtExtreme = scrollY <= 50 || scrollY >= heroHeight * 0.8;
      
      const shouldBeLightMode = isNearTop && isHeroSignificantlyVisible;
      
      // Only update if we're at an extreme or the change is significant
      if (isAtExtreme || Math.abs(scrollY - lastScrollY.current) > 50) {
        setIsLightMode(shouldBeLightMode);
      }
      
      lastScrollY.current = scrollY;
    } catch (error) {
      // Fallback to dark mode if there's any error
      console.warn('Error in theme detection:', error);
      setIsLightMode(false);
    }
  }, []);

  // Debounce theme changes to prevent rapid switching
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedIsLightMode(isLightMode);
    }, 150); // 150ms debounce

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLightMode]);

  useEffect(() => {
    // Initial check
    checkTheme();

    // Throttled scroll handler to improve performance
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          checkTheme();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Add event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    
    // Also listen for DOM changes that might affect the hero element
    const observer = new MutationObserver(() => {
      checkTheme();
    });
    
    // Observe the entire document for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['id', 'class']
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      observer.disconnect();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [checkTheme]);

  return { isLightMode: debouncedIsLightMode };
}; 