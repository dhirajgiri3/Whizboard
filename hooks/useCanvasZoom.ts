import { useState, useCallback, RefObject } from 'react';
import Konva from 'konva';
import { ILine } from '@/types';
import { toast } from 'sonner';

export interface UseCanvasZoomReturn {
  currentZoom: number;
  resetZoom: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitToScreen: (lines: ILine[]) => void;
  setCurrentZoom: (zoom: number) => void;
}

export function useCanvasZoom(stageRef: RefObject<Konva.Stage>): UseCanvasZoomReturn {
  const [currentZoom, setCurrentZoom] = useState(100);
  
  const resetZoom = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const newScale = 1;
    const newPos = { x: 0, y: 0 };

    stage.to({
      scaleX: newScale,
      scaleY: newScale,
      x: newPos.x,
      y: newPos.y,
      duration: 0.4,
    });

    setCurrentZoom(100);
  }, [stageRef]);

  const zoomIn = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const newScale = Math.min(4, oldScale * 1.3);

    const center = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };

    const mousePointTo = {
      x: (center.x - stage.x()) / oldScale,
      y: (center.y - stage.y()) / oldScale,
    };

    const newPos = {
      x: center.x - mousePointTo.x * newScale,
      y: center.y - mousePointTo.y * newScale,
    };

    stage.to({
      scaleX: newScale,
      scaleY: newScale,
      x: newPos.x,
      y: newPos.y,
      duration: 0.3,
      easing: Konva.Easings.EaseOut,
    });

    setCurrentZoom(Math.round(newScale * 100));
  }, [stageRef]);

  const zoomOut = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const newScale = Math.max(0.1, oldScale / 1.3);

    const center = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };

    const mousePointTo = {
      x: (center.x - stage.x()) / oldScale,
      y: (center.y - stage.y()) / oldScale,
    };

    const newPos = {
      x: center.x - mousePointTo.x * newScale,
      y: center.y - mousePointTo.y * newScale,
    };

    stage.to({
      scaleX: newScale,
      scaleY: newScale,
      x: newPos.x,
      y: newPos.y,
      duration: 0.3,
      easing: Konva.Easings.EaseOut,
    });

    setCurrentZoom(Math.round(newScale * 100));
  }, [stageRef]);

  const fitToScreen = useCallback((lines: ILine[]) => {
    const stage = stageRef.current;
    if (!stage || lines.length === 0) {
      toast.info('No content to fit to screen');
      return;
    }

    // Calculate bounding box of all lines
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;

    lines.forEach((line) => {
      for (let i = 0; i < line.points.length; i += 2) {
        const x = line.points[i];
        const y = line.points[i + 1];
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    });

    if (minX === Infinity) return;

    const padding = 50;
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    const scaleX = (window.innerWidth - padding * 2) / contentWidth;
    const scaleY = (window.innerHeight - padding * 2) / contentHeight;
    const newScale = Math.min(scaleX, scaleY, 2);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const newPos = {
      x: window.innerWidth / 2 - centerX * newScale,
      y: window.innerHeight / 2 - centerY * newScale,
    };

    stage.to({
      scaleX: newScale,
      scaleY: newScale,
      x: newPos.x,
      y: newPos.y,
      duration: 0.5,
      easing: Konva.Easings.EaseInOut,
    });

    setCurrentZoom(Math.round(newScale * 100));
  }, [stageRef]);

  return {
    currentZoom,
    resetZoom,
    zoomIn,
    zoomOut,
    fitToScreen,
    setCurrentZoom
  };
}