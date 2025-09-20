import { useEffect } from "react";
import { Dispatch, SetStateAction } from "react";
import { Tool } from "@/types";

interface UseBoardKeyboardProps {
  boardId: string;
  canUndo: boolean;
  canRedo: boolean;
  handleUndo: () => void;
  handleRedo: () => void;
  handleClearCanvas: () => void;
  setCurrentTool: Dispatch<SetStateAction<Tool>>;
  setShowGrid: Dispatch<SetStateAction<boolean>>;
  setCurrentZoom: Dispatch<SetStateAction<number>>;
  setSelectedStickyNote: Dispatch<SetStateAction<string | null>>;
  setSelectedFrame: Dispatch<SetStateAction<string | null>>;
  setSelectedTextElement: Dispatch<SetStateAction<string | null>>;
  setSelectedShape: Dispatch<SetStateAction<string | null>>;
  setSelectedShapes: Dispatch<SetStateAction<string[]>>;
  updateBoardName: (name: string) => void;
}

export const useBoardKeyboard = (props: UseBoardKeyboardProps) => {
  const {
    boardId,
    canUndo,
    canRedo,
    handleUndo,
    handleRedo,
    handleClearCanvas,
    setCurrentTool,
    setShowGrid,
    setCurrentZoom,
    setSelectedStickyNote,
    setSelectedFrame,
    setSelectedTextElement,
    setSelectedShape,
    setSelectedShapes,
    updateBoardName,
  } = props;

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Z: Undo
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) {
          handleUndo();
        }
      }

      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y: Redo
      if (
        ((e.ctrlKey || e.metaKey) && e.key === "z" && e.shiftKey) ||
        ((e.ctrlKey || e.metaKey) && e.key === "y")
      ) {
        e.preventDefault();
        if (canRedo) {
          handleRedo();
        }
      }

      // Ctrl/Cmd + S: Save/Export
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        // Save functionality
      }

      // Ctrl/Cmd + Shift + S: Share
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "S") {
        e.preventDefault();
        // Share functionality
      }

      // Ctrl/Cmd + R: Rename
      if ((e.ctrlKey || e.metaKey) && e.key === "r") {
        e.preventDefault();
        // Rename functionality
      }

      // Ctrl/Cmd + Plus: Zoom in
      if ((e.ctrlKey || e.metaKey) && e.key === "=") {
        e.preventDefault();
        setCurrentZoom((prev: number) => Math.min(prev + 10, 300));
      }

      // Ctrl/Cmd + Minus: Zoom out
      if ((e.ctrlKey || e.metaKey) && e.key === "-") {
        e.preventDefault();
        setCurrentZoom((prev: number) => Math.max(prev - 10, 10));
      }

      // Ctrl/Cmd + 0: Reset zoom
      if ((e.ctrlKey || e.metaKey) && e.key === "0") {
        e.preventDefault();
        setCurrentZoom(100);
      }

      // G: Toggle grid
      if (e.key === "g" || e.key === "G") {
        e.preventDefault();
        setShowGrid((prev: boolean) => !prev);
      }

      // Tool shortcuts
      if (e.key === "1") {
        e.preventDefault();
        setCurrentTool("pen");
      }
      if (e.key === "2") {
        e.preventDefault();
        setCurrentTool("eraser");
      }
      if (e.key === "3") {
        e.preventDefault();
        setCurrentTool("sticky-note");
      }
      if (e.key === "4") {
        e.preventDefault();
        setCurrentTool("frame");
      }
      if (e.key === "5") {
        e.preventDefault();
        setCurrentTool("text");
      }
      if (e.key === "6") {
        e.preventDefault();
        setCurrentTool("shapes");
      }

      // Ctrl/Cmd + A: Select all
      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        e.preventDefault();
        // Select all functionality
      }

      // Ctrl/Cmd + D: Deselect all
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        setSelectedStickyNote(null);
        setSelectedFrame(null);
        setSelectedTextElement(null);
        setSelectedShape(null);
        setSelectedShapes([]);
      }

      // Ctrl/Cmd + Delete: Clear canvas
      if ((e.ctrlKey || e.metaKey) && e.key === "Delete") {
        e.preventDefault();
        handleClearCanvas();
      }
    };

    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [
    canUndo,
    canRedo,
    handleUndo,
    handleRedo,
    handleClearCanvas,
    setCurrentTool,
    setShowGrid,
    setCurrentZoom,
    setSelectedStickyNote,
    setSelectedFrame,
    setSelectedTextElement,
    setSelectedShape,
    setSelectedShapes,
    updateBoardName,
  ]);
}; 