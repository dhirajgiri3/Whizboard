import { useState, useCallback } from "react";

export const useStickyNoteColorPicker = () => {
  const [currentColor, setCurrentColor] = useState("#FFD700");

  const handleApply = useCallback(() => {
    // Apply color logic here
  }, []);

  return {
    currentColor,
    setCurrentColor,
    handleApply,
  };
}; 