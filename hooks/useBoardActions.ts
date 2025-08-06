import { useCallback } from "react";
import { useMutation } from "@apollo/client";
import { ADD_BOARD_ACTION } from "@/utils/boardGraphQL";
import logger from "@/lib/logger/logger";
import { ILine } from "@/types";

interface UseBoardActionsProps {
  boardId: string;
  setLines: (lines: ILine[]) => void;
  setStickyNotes: (notes: any[]) => void;
  setFrames: (frames: any[]) => void;
  setTextElements: (elements: any[]) => void;
  setShapes: (shapes: any[]) => void;
  setHistory: (history: any[]) => void;
  setHistoryIndex: (index: number) => void;
  updateBoardTimestamp: (boardId: string) => Promise<void>;
  broadcastDrawingComplete: (data: any) => void;
}

export const useBoardActions = (props: UseBoardActionsProps) => {
  const {
    boardId,
    setLines,
    setStickyNotes,
    setFrames,
    setTextElements,
    setShapes,
    setHistory,
    setHistoryIndex,
    updateBoardTimestamp,
    broadcastDrawingComplete,
  } = props;

  const [addBoardAction] = useMutation(ADD_BOARD_ACTION);

  const handleSetLines = useCallback(async (newLines: ILine[]) => {
    const drawnLine = newLines[newLines.length - 1];
    if (!drawnLine || !boardId) {
      logger.warn({ drawnLine: !!drawnLine, boardId }, "Missing required data for handleSetLines");
      return;
    }

    try {
      const lineWithId = {
        ...drawnLine,
        id: drawnLine.id || `line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };

      // Validate required fields
      if (
        !lineWithId.id ||
        !lineWithId.points ||
        !lineWithId.tool ||
        !lineWithId.color ||
        typeof lineWithId.strokeWidth !== "number"
      ) {
        logger.warn({ lineWithId }, "Invalid line data for board action");
        return;
      }

      // Broadcast drawing completion
      try {
        broadcastDrawingComplete({
          id: lineWithId.id,
          points: lineWithId.points,
          tool: lineWithId.tool,
          color: lineWithId.color,
          strokeWidth: lineWithId.strokeWidth,
        });
      } catch (broadcastError) {
        logger.warn({ broadcastError }, "Failed to broadcast drawing completion");
      }

      // Add board action
      const { data } = await addBoardAction({
        variables: {
          boardId,
          action: JSON.stringify({
            type: "add",
            data: JSON.stringify(lineWithId),
          }),
        },
      });

      if (!data?.addBoardAction) {
        logger.warn({ data }, "No data returned from addBoardAction");
        return;
      }

      const allElements = data.addBoardAction.elements || [];
      const lineElements = allElements
        .filter((el: { data: string }) => {
          try {
            const parsed = typeof el.data === "string" ? JSON.parse(el.data) : el.data;
            return parsed.type !== "sticky-note";
          } catch (parseError) {
            logger.warn({ parseError, element: el }, "Failed to parse element data");
            return false;
          }
        })
        .map((el: { data: string }) => {
          try {
            return typeof el.data === "string" ? JSON.parse(el.data) : el.data;
          } catch (parseError) {
            logger.warn({ parseError, element: el }, "Failed to parse element data in map");
            return null;
          }
        })
        .filter(Boolean);

      setLines(lineElements);
      setHistory(data.addBoardAction.history || []);
      setHistoryIndex(data.addBoardAction.historyIndex ?? 0);

      try {
        await updateBoardTimestamp(boardId);
      } catch (timestampError) {
        logger.warn({ timestampError }, "Failed to update board timestamp");
      }
    } catch (err) {
      logger.error({ err, boardId, drawnLine }, "Failed to add board action");
    }
  }, [boardId, addBoardAction, broadcastDrawingComplete, setLines, setHistory, setHistoryIndex, updateBoardTimestamp]);

  const handleErase = useCallback(async (lineId: string) => {
    if (!lineId || !boardId) {
      logger.warn({ lineId, boardId }, "Missing required data for handleErase");
      return;
    }

    try {
      const { data } = await addBoardAction({
        variables: {
          boardId,
          action: JSON.stringify({
            type: "remove",
            data: JSON.stringify({ id: lineId }),
          }),
        },
      });

      if (!data?.addBoardAction) {
        logger.warn({ data }, "No data returned from addBoardAction in handleErase");
        return;
      }

      const allElements = data.addBoardAction.elements || [];
      const lineElements = allElements
        .filter((el: { data: string }) => {
          try {
            const parsed = typeof el.data === "string" ? JSON.parse(el.data) : el.data;
            return parsed.type !== "sticky-note";
          } catch (parseError) {
            logger.warn({ parseError, element: el }, "Failed to parse element data in handleErase");
            return false;
          }
        })
        .map((el: { data: string }) => {
          try {
            return typeof el.data === "string" ? JSON.parse(el.data) : el.data;
          } catch (parseError) {
            logger.warn({ parseError, element: el }, "Failed to parse element data in map");
            return null;
          }
        })
        .filter(Boolean);

      setLines(lineElements);
      setHistory(data.addBoardAction.history || []);
      setHistoryIndex(data.addBoardAction.historyIndex ?? 0);

      try {
        await updateBoardTimestamp(boardId);
      } catch (timestampError) {
        logger.warn({ timestampError }, "Failed to update board timestamp");
      }
    } catch (err) {
      logger.error({ err, boardId, lineId }, "Failed to erase line");
    }
  }, [boardId, addBoardAction, setLines, setHistory, setHistoryIndex, updateBoardTimestamp]);

  const handleClearCanvas = useCallback(async () => {
    if (!boardId) {
      logger.warn({ boardId }, "Missing boardId for handleClearCanvas");
      return;
    }

    try {
      const { data } = await addBoardAction({
        variables: {
          boardId,
          action: JSON.stringify({
            type: "clear",
            data: JSON.stringify({}),
          }),
        },
      });

      if (!data?.addBoardAction) {
        logger.warn({ data }, "No data returned from addBoardAction in handleClearCanvas");
        return;
      }

      setLines([]);
      setStickyNotes([]);
      setFrames([]);
      setTextElements([]);
      setShapes([]);
      setHistory(data.addBoardAction.history || []);
      setHistoryIndex(data.addBoardAction.historyIndex ?? 0);

      try {
        await updateBoardTimestamp(boardId);
      } catch (timestampError) {
        logger.warn({ timestampError }, "Failed to update board timestamp");
      }
    } catch (err) {
      logger.error({ err, boardId }, "Failed to clear canvas");
    }
  }, [boardId, addBoardAction, setLines, setStickyNotes, setFrames, setTextElements, setShapes, setHistory, setHistoryIndex, updateBoardTimestamp]);

  return {
    handleSetLines,
    handleErase,
    handleClearCanvas,
  };
}; 