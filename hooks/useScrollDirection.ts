import { useState, useEffect } from 'react';

type ScrollDirection = 'up' | 'down' | null;

interface UseScrollDirectionReturn {
  scrollDirection: ScrollDirection;
  isScrolled: boolean;
  scrollY: number;
}

export const useScrollDirection = (threshold: number = 10): UseScrollDirectionReturn => {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      setIsScrolled(currentScrollY > 20);

      // Only update direction if we've scrolled more than the threshold
      if (Math.abs(currentScrollY - lastScrollY) > threshold) {
        const direction: ScrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
        setScrollDirection(direction);
        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, threshold]);

  return { scrollDirection, isScrolled, scrollY };
}; 