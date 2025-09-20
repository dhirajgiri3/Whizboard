import { useCallback } from "react";
import { useMutation } from "@apollo/client";
import { UNDO_BOARD_ACTION, REDO_BOARD_ACTION } from "@/utils/boardGraphQL";
import logger from "@/lib/logger/logger";

interface UseBoardHistoryProps {
  boardId: string;
  setLines: (lines: any[]) => void;
  setStickyNotes: (notes: any[]) => void;
  setFrames: (frames: any[]) => void;
  setTextElements: (elements: any[]) => void;
  setShapes: (shapes: any[]) => void;
  setHistory: (history: any[]) => void;
  setHistoryIndex: (index: number) => void;
  setSelectedStickyNote: (id: string | null) => void;
  setSelectedFrame: (id: string | null) => void;
  setSelectedTextElement: (id: string | null) => void;
  setEditingTextElement: (id: string | null) => void;
  setSelectedShape: (id: string | null) => void;
  setSelectedShapes: (shapes: string[]) => void;
  updateBoardTimestamp: (boardId: string) => Promise<void>;
}

export const useBoardHistory = (props: UseBoardHistoryProps) => {
  const {
    boardId,
    setLines,
    setStickyNotes,
    setFrames,
    setTextElements,
    setShapes,
    setHistory,
    setHistoryIndex,
    setSelectedStickyNote,
    setSelectedFrame,
    setSelectedTextElement,
    setEditingTextElement,
    setSelectedShape,
    setSelectedShapes,
    updateBoardTimestamp,
  } = props;

  const [undoBoardAction] = useMutation(UNDO_BOARD_ACTION);
  const [redoBoardAction] = useMutation(REDO_BOARD_ACTION);

  const handleUndo = useCallback(async () => {
    if (!boardId) {
      logger.warn({ boardId }, "Missing boardId for handleUndo");
      return;
    }

    try {
      const { data } = await undoBoardAction({
        variables: { boardId },
      });

      if (!data?.undoBoardAction) {
        logger.warn({ data }, "No data returned from undoBoardAction");
        return;
      }

      const allElements = data.undoBoardAction.elements || [];

      // Filter drawing lines (non-sticky-note, non-frame, non-text elements)
      const lineElements = allElements
        .filter((el: { data: string }) => {
          const parsed = typeof el.data === "string" ? JSON.parse(el.data) : el.data;
          return (
            parsed.type !== "sticky-note" &&
            parsed.type !== "frame" &&
            parsed.type !== "text"
          );
        })
        .map((el: { data: string }) =>
          typeof el.data === "string" ? JSON.parse(el.data) : el.data
        );

      // Filter sticky notes
      const stickyNoteElements = allElements
        .filter((el: { data: string }) => {
          const parsed = typeof el.data === "string" ? JSON.parse(el.data) : el.data;
          return parsed.type === "sticky-note";
        })
        .map((el: { data: string }) =>
          typeof el.data === "string" ? JSON.parse(el.data) : el.data
        );

      // Filter frames
      const frameElements = allElements
        .filter((el: { data: string }) => {
          const parsed = typeof el.data === "string" ? JSON.parse(el.data) : el.data;
          return parsed.type === "frame";
        })
        .map((el: { data: string }) =>
          typeof el.data === "string" ? JSON.parse(el.data) : el.data
        );

      // Filter text elements
      const textElementElements = allElements
        .filter((el: { data: string }) => {
          const parsed = typeof el.data === "string" ? JSON.parse(el.data) : el.data;
          return parsed.type === "text";
        })
        .map((el: { data: string }) =>
          typeof el.data === "string" ? JSON.parse(el.data) : el.data
        );

      // Filter shapes
      const shapeElements = allElements
        .filter((el: { data: string }) => {
          const parsed = typeof el.data === "string" ? JSON.parse(el.data) : el.data;
          return parsed.type === "shape";
        })
        .map((el: { data: string }) =>
          typeof el.data === "string" ? JSON.parse(el.data) : el.data
        );

      setLines(lineElements);
      setStickyNotes(stickyNoteElements);
      setFrames(frameElements);
      setTextElements(textElementElements);
      setShapes(shapeElements);
      setHistory(data.undoBoardAction.history || []);
      setHistoryIndex(data.undoBoardAction.historyIndex ?? 0);

      // Clear selections after undo
      setSelectedStickyNote(null);
      setSelectedFrame(null);
      setSelectedTextElement(null);
      setEditingTextElement(null);
      setSelectedShape(null);
      setSelectedShapes([]);

      try {
        await updateBoardTimestamp(boardId);
      } catch (timestampError) {
        logger.warn({ timestampError }, "Failed to update board timestamp");
      }
    } catch (err) {
      logger.error({ err, boardId }, "Failed to undo board action");
    }
  }, [boardId, undoBoardAction, setLines, setStickyNotes, setFrames, setTextElements, setShapes, setHistory, setHistoryIndex, setSelectedStickyNote, setSelectedFrame, setSelectedTextElement, setEditingTextElement, setSelectedShape, setSelectedShapes, updateBoardTimestamp]);

  const handleRedo = useCallback(async () => {
    if (!boardId) {
      logger.warn({ boardId }, "Missing boardId for handleRedo");
      return;
    }

    try {
      const { data } = await redoBoardAction({
        variables: { boardId },
      });

      if (!data?.redoBoardAction) {
        logger.warn({ data }, "No data returned from redoBoardAction");
        return;
      }

      const allElements = data.redoBoardAction.elements || [];

      // Filter drawing lines (non-sticky-note, non-frame, non-text elements)
      const lineElements = allElements
        .filter((el: { data: string }) => {
          const parsed = typeof el.data === "string" ? JSON.parse(el.data) : el.data;
          return (
            parsed.type !== "sticky-note" &&
            parsed.type !== "frame" &&
            parsed.type !== "text"
          );
        })
        .map((el: { data: string }) =>
          typeof el.data === "string" ? JSON.parse(el.data) : el.data
        );

      // Filter sticky notes
      const stickyNoteElements = allElements
        .filter((el: { data: string }) => {
          const parsed = typeof el.data === "string" ? JSON.parse(el.data) : el.data;
          return parsed.type === "sticky-note";
        })
        .map((el: { data: string }) =>
          typeof el.data === "string" ? JSON.parse(el.data) : el.data
        );

      // Filter frames
      const frameElements = allElements
        .filter((el: { data: string }) => {
          const parsed = typeof el.data === "string" ? JSON.parse(el.data) : el.data;
          return parsed.type === "frame";
        })
        .map((el: { data: string }) =>
          typeof el.data === "string" ? JSON.parse(el.data) : el.data
        );

      // Filter text elements
      const textElementElements = allElements
        .filter((el: { data: string }) => {
          const parsed = typeof el.data === "string" ? JSON.parse(el.data) : el.data;
          return parsed.type === "text";
        })
        .map((el: { data: string }) =>
          typeof el.data === "string" ? JSON.parse(el.data) : el.data
        );

      // Filter shapes
      const shapeElements = allElements
        .filter((el: { data: string }) => {
          const parsed = typeof el.data === "string" ? JSON.parse(el.data) : el.data;
          return parsed.type === "shape";
        })
        .map((el: { data: string }) =>
          typeof el.data === "string" ? JSON.parse(el.data) : el.data
        );

      setLines(lineElements);
      setStickyNotes(stickyNoteElements);
      setFrames(frameElements);
      setTextElements(textElementElements);
      setShapes(shapeElements);
      setHistory(data.redoBoardAction.history || []);
      setHistoryIndex(data.redoBoardAction.historyIndex ?? 0);

      // Clear selections after redo
      setSelectedStickyNote(null);
      setSelectedFrame(null);
      setSelectedTextElement(null);
      setEditingTextElement(null);
      setSelectedShape(null);
      setSelectedShapes([]);

      try {
        await updateBoardTimestamp(boardId);
      } catch (timestampError) {
        logger.warn({ timestampError }, "Failed to update board timestamp");
      }
    } catch (err) {
      logger.error({ err, boardId }, "Failed to redo board action");
    }
  }, [boardId, redoBoardAction, setLines, setStickyNotes, setFrames, setTextElements, setShapes, setHistory, setHistoryIndex, setSelectedStickyNote, setSelectedFrame, setSelectedTextElement, setEditingTextElement, setSelectedShape, setSelectedShapes, updateBoardTimestamp]);

  return {
    handleUndo,
    handleRedo,
  };
}; 