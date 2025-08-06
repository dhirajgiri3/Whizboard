import { useCallback } from "react";
import { useMutation } from "@apollo/client";
import { ADD_BOARD_ACTION } from "@/utils/boardGraphQL";
import logger from "@/lib/logger/logger";

interface UseBoardElementHandlersProps {
  boardId: string;
  session: any;
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

export const useBoardElementHandlers = (props: UseBoardElementHandlersProps) => {
  const {
    boardId,
    session,
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

  const [addBoardAction] = useMutation(ADD_BOARD_ACTION);

  // Sticky Note Handlers
  const handleStickyNoteAdd = useCallback(async (stickyNote: any) => {
    if (!boardId) return;

    try {
      const { data } = await addBoardAction({
        variables: {
          boardId,
          action: JSON.stringify({
            type: "add",
            data: JSON.stringify({ ...stickyNote, type: "sticky-note" }),
          }),
        },
      });

      if (data?.addBoardAction) {
        const allElements = data.addBoardAction.elements || [];
        const stickyNoteElements = allElements
          .filter((el: { data: string }) => {
            const parsed = typeof el.data === "string" ? JSON.parse(el.data) : el.data;
            return parsed.type === "sticky-note";
          })
          .map((el: { data: string }) =>
            typeof el.data === "string" ? JSON.parse(el.data) : el.data
          );

        setStickyNotes(stickyNoteElements);
        setHistory(data.addBoardAction.history || []);
        setHistoryIndex(data.addBoardAction.historyIndex ?? 0);
        await updateBoardTimestamp(boardId);
      }
    } catch (err) {
      logger.error({ err, boardId }, "Failed to add sticky note");
    }
  }, [boardId, addBoardAction, setStickyNotes, setHistory, setHistoryIndex, updateBoardTimestamp]);

  const handleStickyNoteUpdate = useCallback(async (stickyNote: any) => {
    if (!boardId) return;

    try {
      const { data } = await addBoardAction({
        variables: {
          boardId,
          action: JSON.stringify({
            type: "update",
            data: JSON.stringify({ ...stickyNote, type: "sticky-note" }),
          }),
        },
      });

      if (data?.addBoardAction) {
        const allElements = data.addBoardAction.elements || [];
        const stickyNoteElements = allElements
          .filter((el: { data: string }) => {
            const parsed = typeof el.data === "string" ? JSON.parse(el.data) : el.data;
            return parsed.type === "sticky-note";
          })
          .map((el: { data: string }) =>
            typeof el.data === "string" ? JSON.parse(el.data) : el.data
          );

        setStickyNotes(stickyNoteElements);
        setHistory(data.addBoardAction.history || []);
        setHistoryIndex(data.addBoardAction.historyIndex ?? 0);
        await updateBoardTimestamp(boardId);
      }
    } catch (err) {
      logger.error({ err, boardId }, "Failed to update sticky note");
    }
  }, [boardId, addBoardAction, setStickyNotes, setHistory, setHistoryIndex, updateBoardTimestamp]);

  const handleStickyNoteDelete = useCallback(async (stickyNoteId: string) => {
    if (!boardId) return;

    try {
      const { data } = await addBoardAction({
        variables: {
          boardId,
          action: JSON.stringify({
            type: "remove",
            data: JSON.stringify({ id: stickyNoteId, type: "sticky-note" }),
          }),
        },
      });

      if (data?.addBoardAction) {
        const allElements = data.addBoardAction.elements || [];
        const stickyNoteElements = allElements
          .filter((el: { data: string }) => {
            const parsed = typeof el.data === "string" ? JSON.parse(el.data) : el.data;
            return parsed.type === "sticky-note";
          })
          .map((el: { data: string }) =>
            typeof el.data === "string" ? JSON.parse(el.data) : el.data
          );

        setStickyNotes(stickyNoteElements);
        setHistory(data.addBoardAction.history || []);
        setHistoryIndex(data.addBoardAction.historyIndex ?? 0);
        setSelectedStickyNote(null);
        await updateBoardTimestamp(boardId);
      }
    } catch (err) {
      logger.error({ err, boardId }, "Failed to delete sticky note");
    }
  }, [boardId, addBoardAction, setStickyNotes, setHistory, setHistoryIndex, setSelectedStickyNote, updateBoardTimestamp]);

  // Frame Handlers
  const handleFrameAdd = useCallback(async (frame: any) => {
    if (!boardId) return;

    try {
      const { data } = await addBoardAction({
        variables: {
          boardId,
          action: JSON.stringify({
            type: "add",
            data: JSON.stringify({ ...frame, type: "frame" }),
          }),
        },
      });

      if (data?.addBoardAction) {
        const allElements = data.addBoardAction.elements || [];
        const frameElements = allElements
          .filter((el: { data: string }) => {
            const parsed = typeof el.data === "string" ? JSON.parse(el.data) : el.data;
            return parsed.type === "frame";
          })
          .map((el: { data: string }) =>
            typeof el.data === "string" ? JSON.parse(el.data) : el.data
          );

        setFrames(frameElements);
        setHistory(data.addBoardAction.history || []);
        setHistoryIndex(data.addBoardAction.historyIndex ?? 0);
        await updateBoardTimestamp(boardId);
      }
    } catch (err) {
      logger.error({ err, boardId }, "Failed to add frame");
    }
  }, [boardId, addBoardAction, setFrames, setHistory, setHistoryIndex, updateBoardTimestamp]);

  const handleFrameUpdate = useCallback(async (frame: any) => {
    if (!boardId) return;

    try {
      const { data } = await addBoardAction({
        variables: {
          boardId,
          action: JSON.stringify({
            type: "update",
            data: JSON.stringify({ ...frame, type: "frame" }),
          }),
        },
      });

      if (data?.addBoardAction) {
        const allElements = data.addBoardAction.elements || [];
        const frameElements = allElements
          .filter((el: { data: string }) => {
            const parsed = typeof el.data === "string" ? JSON.parse(el.data) : el.data;
            return parsed.type === "frame";
          })
          .map((el: { data: string }) =>
            typeof el.data === "string" ? JSON.parse(el.data) : el.data
          );

        setFrames(frameElements);
        setHistory(data.addBoardAction.history || []);
        setHistoryIndex(data.addBoardAction.historyIndex ?? 0);
        await updateBoardTimestamp(boardId);
      }
    } catch (err) {
      logger.error({ err, boardId }, "Failed to update frame");
    }
  }, [boardId, addBoardAction, setFrames, setHistory, setHistoryIndex, updateBoardTimestamp]);

  const handleFrameDelete = useCallback(async (frameId: string) => {
    if (!boardId) return;

    try {
      const { data } = await addBoardAction({
        variables: {
          boardId,
          action: JSON.stringify({
            type: "remove",
            data: JSON.stringify({ id: frameId, type: "frame" }),
          }),
        },
      });

      if (data?.addBoardAction) {
        const allElements = data.addBoardAction.elements || [];
        const frameElements = allElements
          .filter((el: { data: string }) => {
            const parsed = typeof el.data === "string" ? JSON.parse(el.data) : el.data;
            return parsed.type === "frame";
          })
          .map((el: { data: string }) =>
            typeof el.data === "string" ? JSON.parse(el.data) : el.data
          );

        setFrames(frameElements);
        setHistory(data.addBoardAction.history || []);
        setHistoryIndex(data.addBoardAction.historyIndex ?? 0);
        setSelectedFrame(null);
        await updateBoardTimestamp(boardId);
      }
    } catch (err) {
      logger.error({ err, boardId }, "Failed to delete frame");
    }
  }, [boardId, addBoardAction, setFrames, setHistory, setHistoryIndex, setSelectedFrame, updateBoardTimestamp]);

  // Text Element Handlers
  const handleTextElementAdd = useCallback(async (textElement: any) => {
    if (!boardId) return;

    try {
      const { data } = await addBoardAction({
        variables: {
          boardId,
          action: JSON.stringify({
            type: "add",
            data: JSON.stringify({ ...textElement, type: "text" }),
          }),
        },
      });

      if (data?.addBoardAction) {
        const allElements = data.addBoardAction.elements || [];
        const textElementElements = allElements
          .filter((el: { data: string }) => {
            const parsed = typeof el.data === "string" ? JSON.parse(el.data) : el.data;
            return parsed.type === "text";
          })
          .map((el: { data: string }) =>
            typeof el.data === "string" ? JSON.parse(el.data) : el.data
          );

        setTextElements(textElementElements);
        setHistory(data.addBoardAction.history || []);
        setHistoryIndex(data.addBoardAction.historyIndex ?? 0);
        await updateBoardTimestamp(boardId);
      }
    } catch (err) {
      logger.error({ err, boardId }, "Failed to add text element");
    }
  }, [boardId, addBoardAction, setTextElements, setHistory, setHistoryIndex, updateBoardTimestamp]);

  const handleTextElementUpdate = useCallback(async (textElement: any) => {
    if (!boardId) return;

    try {
      const { data } = await addBoardAction({
        variables: {
          boardId,
          action: JSON.stringify({
            type: "update",
            data: JSON.stringify({ ...textElement, type: "text" }),
          }),
        },
      });

      if (data?.addBoardAction) {
        const allElements = data.addBoardAction.elements || [];
        const textElementElements = allElements
          .filter((el: { data: string }) => {
            const parsed = typeof el.data === "string" ? JSON.parse(el.data) : el.data;
            return parsed.type === "text";
          })
          .map((el: { data: string }) =>
            typeof el.data === "string" ? JSON.parse(el.data) : el.data
          );

        setTextElements(textElementElements);
        setHistory(data.addBoardAction.history || []);
        setHistoryIndex(data.addBoardAction.historyIndex ?? 0);
        await updateBoardTimestamp(boardId);
      }
    } catch (err) {
      logger.error({ err, boardId }, "Failed to update text element");
    }
  }, [boardId, addBoardAction, setTextElements, setHistory, setHistoryIndex, updateBoardTimestamp]);

  const handleTextElementDelete = useCallback(async (textElementId: string) => {
    if (!boardId) return;

    try {
      const { data } = await addBoardAction({
        variables: {
          boardId,
          action: JSON.stringify({
            type: "remove",
            data: JSON.stringify({ id: textElementId, type: "text" }),
          }),
        },
      });

      if (data?.addBoardAction) {
        const allElements = data.addBoardAction.elements || [];
        const textElementElements = allElements
          .filter((el: { data: string }) => {
            const parsed = typeof el.data === "string" ? JSON.parse(el.data) : el.data;
            return parsed.type === "text";
          })
          .map((el: { data: string }) =>
            typeof el.data === "string" ? JSON.parse(el.data) : el.data
          );

        setTextElements(textElementElements);
        setHistory(data.addBoardAction.history || []);
        setHistoryIndex(data.addBoardAction.historyIndex ?? 0);
        setSelectedTextElement(null);
        setEditingTextElement(null);
        await updateBoardTimestamp(boardId);
      }
    } catch (err) {
      logger.error({ err, boardId }, "Failed to delete text element");
    }
  }, [boardId, addBoardAction, setTextElements, setHistory, setHistoryIndex, setSelectedTextElement, setEditingTextElement, updateBoardTimestamp]);

  const handleTextElementSelect = useCallback((id: string | null) => {
    setSelectedTextElement(id);
  }, [setSelectedTextElement]);

  const handleTextElementStartEdit = useCallback((id: string) => {
    setEditingTextElement(id);
  }, [setEditingTextElement]);

  const handleTextElementFinishEdit = useCallback(() => {
    setEditingTextElement(null);
  }, [setEditingTextElement]);

  // Shape Handlers
  const handleShapeAdd = useCallback(async (shape: any) => {
    if (!boardId) return;

    try {
      const { data } = await addBoardAction({
        variables: {
          boardId,
          action: JSON.stringify({
            type: "add",
            data: JSON.stringify({ ...shape, type: "shape" }),
          }),
        },
      });

      if (data?.addBoardAction) {
        const allElements = data.addBoardAction.elements || [];
        const shapeElements = allElements
          .filter((el: { data: string }) => {
            const parsed = typeof el.data === "string" ? JSON.parse(el.data) : el.data;
            return parsed.type === "shape";
          })
          .map((el: { data: string }) =>
            typeof el.data === "string" ? JSON.parse(el.data) : el.data
          );

        setShapes(shapeElements);
        setHistory(data.addBoardAction.history || []);
        setHistoryIndex(data.addBoardAction.historyIndex ?? 0);
        await updateBoardTimestamp(boardId);
      }
    } catch (err) {
      logger.error({ err, boardId }, "Failed to add shape");
    }
  }, [boardId, addBoardAction, setShapes, setHistory, setHistoryIndex, updateBoardTimestamp]);

  const handleShapeUpdate = useCallback(async (shape: any) => {
    if (!boardId) return;

    try {
      const { data } = await addBoardAction({
        variables: {
          boardId,
          action: JSON.stringify({
            type: "update",
            data: JSON.stringify({ ...shape, type: "shape" }),
          }),
        },
      });

      if (data?.addBoardAction) {
        const allElements = data.addBoardAction.elements || [];
        const shapeElements = allElements
          .filter((el: { data: string }) => {
            const parsed = typeof el.data === "string" ? JSON.parse(el.data) : el.data;
            return parsed.type === "shape";
          })
          .map((el: { data: string }) =>
            typeof el.data === "string" ? JSON.parse(el.data) : el.data
          );

        setShapes(shapeElements);
        setHistory(data.addBoardAction.history || []);
        setHistoryIndex(data.addBoardAction.historyIndex ?? 0);
        await updateBoardTimestamp(boardId);
      }
    } catch (err) {
      logger.error({ err, boardId }, "Failed to update shape");
    }
  }, [boardId, addBoardAction, setShapes, setHistory, setHistoryIndex, updateBoardTimestamp]);

  const handleShapeDelete = useCallback(async (shapeId: string) => {
    if (!boardId) return;

    try {
      const { data } = await addBoardAction({
        variables: {
          boardId,
          action: JSON.stringify({
            type: "remove",
            data: JSON.stringify({ id: shapeId, type: "shape" }),
          }),
        },
      });

      if (data?.addBoardAction) {
        const allElements = data.addBoardAction.elements || [];
        const shapeElements = allElements
          .filter((el: { data: string }) => {
            const parsed = typeof el.data === "string" ? JSON.parse(el.data) : el.data;
            return parsed.type === "shape";
          })
          .map((el: { data: string }) =>
            typeof el.data === "string" ? JSON.parse(el.data) : el.data
          );

        setShapes(shapeElements);
        setHistory(data.addBoardAction.history || []);
        setHistoryIndex(data.addBoardAction.historyIndex ?? 0);
        setSelectedShape(null);
        setSelectedShapes([]);
        await updateBoardTimestamp(boardId);
      }
    } catch (err) {
      logger.error({ err, boardId }, "Failed to delete shape");
    }
  }, [boardId, addBoardAction, setShapes, setHistory, setHistoryIndex, setSelectedShape, setSelectedShapes, updateBoardTimestamp]);

  return {
    handleStickyNoteAdd,
    handleStickyNoteUpdate,
    handleStickyNoteDelete,
    handleFrameAdd,
    handleFrameUpdate,
    handleFrameDelete,
    handleTextElementAdd,
    handleTextElementUpdate,
    handleTextElementDelete,
    handleTextElementSelect,
    handleTextElementStartEdit,
    handleTextElementFinishEdit,
    handleShapeAdd,
    handleShapeUpdate,
    handleShapeDelete,
  };
}; 