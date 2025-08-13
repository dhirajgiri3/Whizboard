import { useCallback, useRef } from "react";
import { Stage } from "konva/lib/Stage";

export const useBoardZoom = (stageRef: React.RefObject<Stage>) => {
  const currentZoom = useRef(100);

  const setCurrentZoom = useCallback((zoom: number) => {
    currentZoom.current = zoom;
  }, []);

  const handleZoomIn = useCallback(() => {
    if (!stageRef.current) return;

    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const newScale = Math.min(oldScale * 1.2, 3); // Max zoom 300%

    stage.scale({ x: newScale, y: newScale });
    setCurrentZoom(Math.round(newScale * 100));
    stage.batchDraw();
  }, [stageRef, setCurrentZoom]);

  const handleZoomOut = useCallback(() => {
    if (!stageRef.current) return;

    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const newScale = Math.max(oldScale / 1.2, 0.1); // Min zoom 10%

    stage.scale({ x: newScale, y: newScale });
    setCurrentZoom(Math.round(newScale * 100));
    stage.batchDraw();
  }, [stageRef, setCurrentZoom]);

  const handleResetZoom = useCallback(() => {
    if (!stageRef.current) return;

    const stage = stageRef.current;
    stage.scale({ x: 1, y: 1 });
    stage.position({ x: 0, y: 0 });
    setCurrentZoom(100);
    stage.batchDraw();
  }, [stageRef, setCurrentZoom]);

  return {
    currentZoom: currentZoom.current,
    setCurrentZoom,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
  };
}; 