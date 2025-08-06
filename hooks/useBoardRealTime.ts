import { useRef } from "react";
import { Dispatch, SetStateAction } from "react";
import { ILine, StickyNoteElement, FrameElement, TextElement, ShapeElement } from "@/types";
import useRealTimeCollaboration from "./useRealTimeCollaboration";

interface UseBoardRealTimeProps {
  boardId: string;
  isOwner: boolean;
  setLines: Dispatch<SetStateAction<ILine[]>>;
  setStickyNotes: Dispatch<SetStateAction<StickyNoteElement[]>>;
  setFrames: Dispatch<SetStateAction<FrameElement[]>>;
  setTextElements: Dispatch<SetStateAction<TextElement[]>>;
  setShapes: Dispatch<SetStateAction<ShapeElement[]>>;
  setHistory: Dispatch<SetStateAction<unknown[]>>;
  setHistoryIndex: Dispatch<SetStateAction<number>>;
}

export const useBoardRealTime = (props: UseBoardRealTimeProps) => {
  const {
    boardId,
    isOwner,
    setLines,
    setStickyNotes,
    setFrames,
    setTextElements,
    setShapes,
    setHistory,
    setHistoryIndex,
  } = props;

  const localUserId = useRef(
    "user-" + Math.random().toString(36).substr(2, 9)
  ).current;

  const {
    cursors,
    broadcastCursorMovement,
    broadcastDrawingStart,
    broadcastDrawingUpdate,
    broadcastDrawingComplete,
    broadcastElementUpdate,
    broadcastTextElementCreate,
    broadcastTextElementUpdate,
    broadcastTextElementDelete,
    broadcastTextElementEditStart,
    broadcastTextElementEditFinish,
    broadcastShapeElementCreate,
    broadcastShapeElementUpdate,
    broadcastShapeElementDelete,
  } = useRealTimeCollaboration({
    boardId,
    userId: localUserId,
    userName: "User",
    isOwner,
    onBoardUpdate: (elements) => {
      const lines: ILine[] = elements.map((el) => ({
        id: el.id,
        points: (el.data.points as number[]) || [],
        tool: (el.data.tool as any) || "pen",
        strokeWidth: (el.data.strokeWidth as number) || 3,
        color: (el.data.color as string) || "#000000",
      }));
      setLines(lines);
    },
    onCursorMove: (cursors) => {
      // Cursor updates are handled by the hook
    },
    onElementAdded: (element) => {
      if (element.type === "text") {
        const newTextElement: TextElement = {
          id: element.id,
          type: "text",
          ...(element.data as Omit<TextElement, "id" | "type">),
        };
        setTextElements((prev: TextElement[]) => [...prev, newTextElement]);
      } else if (element.type === "shape") {
        const newShapeElement: ShapeElement = {
          id: element.id,
          type: "shape",
          ...(element.data as Omit<ShapeElement, "id" | "type">),
        };
        setShapes((prev: ShapeElement[]) => [...prev, newShapeElement]);
      } else {
        const newLine: ILine = {
          id: element.id,
          points: (element.data.points as number[]) || [],
          tool: (element.data.tool as any) || "pen",
          strokeWidth: (element.data.strokeWidth as number) || 3,
          color: (element.data.color as string) || "#000000",
        };
        setLines((prev: ILine[]) => [...prev, newLine]);
      }
    },
  });

  return {
    cursors,
    localUserId,
    broadcastCursorMovement,
    broadcastDrawingStart,
    broadcastDrawingUpdate,
    broadcastDrawingComplete,
    broadcastElementUpdate,
    broadcastTextElementCreate,
    broadcastTextElementUpdate,
    broadcastTextElementDelete,
    broadcastTextElementEditStart,
    broadcastTextElementEditFinish,
    broadcastShapeElementCreate,
    broadcastShapeElementUpdate,
    broadcastShapeElementDelete,
  };
}; 