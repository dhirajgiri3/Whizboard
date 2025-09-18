/**
 * Enhanced Sticky Note Color Management Hook
 * Fixes color selection bugs and provides reliable color state management
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { getStickyNoteColorPalette } from '../components/canvas/stickynote/StickyNote';

interface UseStickyNoteColorResult {
  currentColor: string;
  setColor: (color: string) => void;
  getRandomColor: () => string;
  resetToDefault: () => void;
  colorPalette: string[];
  isValidColor: (color: string) => boolean;
}

interface UseStickyNoteColorProps {
  defaultColor?: string;
  onColorChange?: (color: string) => void;
  persistColor?: boolean;
}

const STORAGE_KEY = 'whizboard-sticky-note-color';
const DEFAULT_COLOR = '#fef3c7'; // Light yellow

/**
 * Enhanced sticky note color management hook
 */
export function useStickyNoteColor({
  defaultColor = DEFAULT_COLOR,
  onColorChange,
  persistColor = true,
}: UseStickyNoteColorProps = {}): UseStickyNoteColorResult {

  const colorPalette = getStickyNoteColorPalette();
  const initializingRef = useRef(true);

  // Initialize color from localStorage or default
  const [currentColor, setCurrentColorState] = useState<string>(() => {
    if (persistColor && typeof window !== 'undefined') {
      const savedColor = localStorage.getItem(STORAGE_KEY);
      if (savedColor && isValidHexColor(savedColor)) {
        return savedColor;
      }
    }
    return defaultColor;
  });

  /**
   * Validate if a color is a valid hex color
   */
  const isValidColor = useCallback((color: string): boolean => {
    return isValidHexColor(color) || colorPalette.includes(color);
  }, [colorPalette]);

  /**
   * Set color with validation and persistence
   */
  const setColor = useCallback((color: string) => {
    if (!color || !isValidHexColor(color)) {
      console.warn(`Invalid color: ${color}, using default`);
      color = defaultColor;
    }

    console.log(`🎨 Setting sticky note color: ${color}`);

    setCurrentColorState(color);

    // Persist to localStorage
    if (persistColor && typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, color);
      } catch (error) {
        console.warn('Failed to save color to localStorage:', error);
      }
    }

    // Notify parent component after state update
    if (onColorChange && !initializingRef.current) {
      onColorChange(color);
    }
  }, [defaultColor, onColorChange, persistColor]);

  /**
   * Get a random color from the palette
   */
  const getRandomColor = useCallback((): string => {
    const randomColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    setColor(randomColor);
    return randomColor;
  }, [colorPalette, setColor]);

  /**
   * Reset to default color
   */
  const resetToDefault = useCallback(() => {
    setColor(defaultColor);
  }, [defaultColor, setColor]);

  // Mark initialization as complete after first render
  useEffect(() => {
    initializingRef.current = false;
  }, []);

  // Sync with external color changes
  useEffect(() => {
    if (defaultColor !== currentColor && initializingRef.current) {
      setColor(defaultColor);
    }
  }, [defaultColor, currentColor, setColor]);

  return {
    currentColor,
    setColor,
    getRandomColor,
    resetToDefault,
    colorPalette,
    isValidColor,
  };
}

/**
 * Validate hex color format
 */
function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}