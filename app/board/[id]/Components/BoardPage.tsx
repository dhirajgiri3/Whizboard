"use client";

import dynamic from "next/dynamic";
import { useRef, useEffect, useCallback, useState } from "react";
import { gql, useMutation, useSubscription, useQuery } from "@apollo/client";
import { useSession } from "next-auth/react";
import MainToolbar from "@/components/toolbar/MainToolbar";
import FloatingStickyNoteToolbar from "@/components/toolbar/stickynote/FloatingStickyNoteToolbar";
import FloatingFrameToolbar from "@/components/toolbar/frame/FloatingFrameToolbar";
import FloatingTextToolbar from "@/components/toolbar/text/FloatingTextToolbar";
import CollaborationPanel from "@/components/layout/CollaborationPanel";
import { useParams } from "next/navigation";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import logger from "@/lib/logger";
import { PageLoading } from "@/components/ui/Loading";
import { X, AlertCircle } from "lucide-react";
import RenameBoardModal from "@/components/ui/modal/RenameBoardModal";
import InviteCollaboratorsModal from "@/components/ui/modal/InviteCollaboratorsModal";
import SuccessModal from "@/components/ui/modal/SuccessModal";
import { toast } from "sonner";
import CanvasHeader from "@/components/layout/CanvasHeader";
import {
  BoardProvider,
  useBoardContext,
} from "@/components/context/BoardContext";
import useRealTimeCollaboration from "@/hooks/useRealTimeCollaboration";
import { StickyNoteElement, FrameElement, ILine, Tool, TextElement } from "@/types";
import { Cursor } from "@/components/canvas/LiveCursors";
import { getRandomStickyNoteColor } from "@/components/canvas/stickynote/StickyNote";
import StickyNoteColorPicker, {
  useStickyNoteColorPicker,
} from "@/components/ui/StickyNoteColorPicker";

// Import hooks and components
import KeyboardShortcuts from "@/components/boardshortcuts/KeyboardShortcuts";
import DrawingToolbar from "@/components/toolbar/pen/DrawingToolbar";

const GET_BOARD = gql`
  query GetBoard($id: String!) {
    getBoard(id: $id) {
      id
      name
      createdAt
      updatedAt
      createdBy
      elements {
        id
        type
        data
      }
    }
  }
`;

const ADD_BOARD_ACTION = gql`
  mutation AddBoardAction($boardId: String!, $action: BoardActionInput!) {
    addBoardAction(boardId: $boardId, action: $action) {
      id
      elements {
        id
        type
        data
      }
      history {
        type
        data
        timestamp
      }
      historyIndex
    }
  }
`;

const UNDO_BOARD_ACTION = gql`
  mutation UndoBoardAction($boardId: String!) {
    undoBoardAction(boardId: $boardId) {
      id
      elements {
        id
        type
        data
      }
      history {
        type
        data
        timestamp
      }
      historyIndex
    }
  }
`;

const REDO_BOARD_ACTION = gql`
  mutation RedoBoardAction($boardId: String!) {
    redoBoardAction(boardId: $boardId) {
      id
      elements {
        id
        type
        data
      }
      history {
        type
        data
        timestamp
      }
      historyIndex
    }
  }
`;

const BOARD_UPDATES = gql`
  subscription BoardUpdates($boardId: String!) {
    boardUpdates(boardId: $boardId) {
      id
      name
      elements {
        id
        type
        data
      }
      history {
        type
        data
        timestamp
      }
      historyIndex
    }
  }
`;

const CURSOR_MOVEMENT = gql`
  subscription CursorMovement($boardId: String!) {
    cursorMovement(boardId: $boardId) {
      x
      y
      userId
    }
  }
`;

const DrawingCanvas = dynamic(
  () => import("@/components/canvas/DrawingCanvas"),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <PageLoading
          title="Loading canvas"
          description="Preparing your collaborative drawing space..."
          variant="default"
        />
      </div>
    ),
  }
);

export default function BoardPage() {
  return (
    <BoardProvider>
      <BoardPageContent />
    </BoardProvider>
  );
}

function BoardPageContent() {
  const { data: session, status } = useSession();
  const params = useParams();
  const boardId = params.id as string;
  const stageRef = useRef<Konva.Stage>(null);
  const {
    setBoardMetadata,
    updateBoardName,
    updateBoardTimestamp,
    fetchBoardMetadata,
  } = useBoardContext();

  // State declarations instead of useBoardState hook
  const [lines, setLines] = useState<ILine[]>([]);
  const [stickyNotes, setStickyNotes] = useState<StickyNoteElement[]>([]);
  const [frames, setFrames] = useState<FrameElement[]>([]);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedStickyNote, setSelectedStickyNote] = useState<string | null>(null);
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null);
  const [selectedTextElement, setSelectedTextElement] = useState<string | null>(null);
  const [editingTextElement, setEditingTextElement] = useState<string | null>(null);
  const [history, setHistory] = useState<unknown[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#2563eb");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollaborationOpen, setIsCollaborationOpen] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [renamedBoard, setRenamedBoard] = useState<{ id: string; name: string } | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isDragInProgress, setIsDragInProgress] = useState(false);
  const [recentDragEnd, setRecentDragEnd] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [currentStickyNoteColor, setCurrentStickyNoteColor] = useState(getRandomStickyNoteColor());

  // Calculate canUndo and canRedo based on current state
  const canUndo = history.length > 0 && historyIndex >= 0;
  const canRedo = history.length > 0 && historyIndex < history.length - 1;

  // Handler functions for interactions
  const handleStickyNoteSelect = useCallback((id: string | null) => {
    setSelectedStickyNote(id);
  }, []);

  const handleFrameSelect = useCallback((id: string | null) => {
    setSelectedFrame(id);
  }, []);

  const handleStickyNoteDragStart = useCallback(() => {
    setIsDragInProgress(true);
  }, []);

  const handleStickyNoteDragEnd = useCallback(() => {
    setIsDragInProgress(false);
    setRecentDragEnd(true);
    setTimeout(() => setRecentDragEnd(false), 100);
  }, []);

  const handleFrameDragStart = useCallback(() => {
    setIsDragInProgress(true);
  }, []);

  const handleFrameDragEnd = useCallback(() => {
    setIsDragInProgress(false);
    setRecentDragEnd(true);
    setTimeout(() => setRecentDragEnd(false), 100);
  }, []);

  // Manual zoom state instead of useCanvasZoom hook
  const [currentZoom, setCurrentZoom] = useState(100);

  const resetZoom = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    
    stage.scale({ x: 1, y: 1 });
    stage.position({ x: 0, y: 0 });
    setCurrentZoom(100);
    stage.batchDraw();
  }, []);

  const zoomIn = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    
    const oldScale = stage.scaleX();
    const newScale = Math.min(oldScale * 1.1, 5);
    const pointer = stage.getPointerPosition() || { x: stage.width() / 2, y: stage.height() / 2 };
    
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    stage.scale({ x: newScale, y: newScale });
    
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
    
    setCurrentZoom(Math.round(newScale * 100));
    stage.batchDraw();
  }, []);

  const zoomOut = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    
    const oldScale = stage.scaleX();
    const newScale = Math.max(oldScale * 0.9, 0.1);
    const pointer = stage.getPointerPosition() || { x: stage.width() / 2, y: stage.height() / 2 };
    
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    stage.scale({ x: newScale, y: newScale });
    
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
    
    setCurrentZoom(Math.round(newScale * 100));
    stage.batchDraw();
  }, []);

  const fitToScreen = useCallback((lines: ILine[]) => {
    const stage = stageRef.current;
    if (!stage || lines.length === 0) return;

    // Calculate bounding box of all lines
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    lines.forEach(line => {
      for (let i = 0; i < line.points.length; i += 2) {
        const x = line.points[i];
        const y = line.points[i + 1];
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    });

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const stageWidth = stage.width();
    const stageHeight = stage.height();
    
    const scaleX = stageWidth / contentWidth;
    const scaleY = stageHeight / contentHeight;
    const scale = Math.min(scaleX, scaleY) * 0.9; // 90% to leave some margin
    
    stage.scale({ x: scale, y: scale });
    stage.position({
      x: (stageWidth - contentWidth * scale) / 2 - minX * scale,
      y: (stageHeight - contentHeight * scale) / 2 - minY * scale,
    });
    
    setCurrentZoom(Math.round(scale * 100));
    stage.batchDraw();
  }, []);

  // Sticky Note Color Picker State
  const colorPicker = useStickyNoteColorPicker();

  // Add drag timeout reference
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  logger.info({ boardId }, "BoardPage loading");

  const {
    data: initialData,
    loading,
    error,
  } = useQuery(GET_BOARD, {
    variables: { id: boardId },
    skip: !boardId,
    onCompleted: (data) => {
      logger.info({ boardId: data.getBoard.id }, "Initial board data loaded");
      if (data.getBoard) {
        setBoardMetadata({
          id: data.getBoard.id,
          name: data.getBoard.name,
          createdAt: data.getBoard.createdAt,
          updatedAt: data.getBoard.updatedAt,
          createdBy: data.getBoard.createdBy,
        });
      }
    },
    onError: (err) => {
      logger.error({ error: err }, "Error loading initial board data");
    },
  });

  // Check if current user is the board owner
  useEffect(() => {
    if (initialData?.getBoard && session?.user?.id) {
      setIsOwner(initialData.getBoard.createdBy === session.user.id);
    }
  }, [initialData?.getBoard, session?.user?.id, setIsOwner]);

  // Setup real-time collaboration
  const {
    cursors: realTimeCursors,
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
  } = useRealTimeCollaboration({
    boardId,
    userId: session?.user?.id,
    userName: session?.user?.name || "Unknown User",
    isOwner,
    onBoardUpdate: (elements) => {
      setLines(
        elements.map((el) => ({
          id: el.id,
          points: (el.data.points as number[]) || [],
          tool: (el.data.tool as Tool) || "pen",
          strokeWidth: (el.data.strokeWidth as number) || 3,
          color: (el.data.color as string) || "#000000",
        }))
      );
    },
    onCursorMove: (cursors) => {
      setCursors(cursors);
    },
    onElementAdded: (element) => {
      if (element.type === 'text') {
        // Handle text element added
        const newTextElement: TextElement = {
          id: element.id,
          type: 'text',
          ...(element.data as any),
        };
        setTextElements(prev => [...prev, newTextElement]);
      } else {
        // Handle line element added
      const newLine: ILine = {
        id: element.id,
        points: (element.data.points as number[]) || [],
        tool: (element.data.tool as Tool) || "pen",
        strokeWidth: (element.data.strokeWidth as number) || 3,
        color: (element.data.color as string) || "#000000",
      };
      setLines((prev) => [...prev, newLine]);
      }
    },
    onElementUpdated: (element) => {
      if (element.type === 'text') {
        // Handle text element updated
        const updatedTextElement: TextElement = {
          id: element.id,
          type: 'text',
          ...(element.data as any),
        };
        setTextElements(prev =>
          prev.map(text => text.id === element.id ? updatedTextElement : text)
        );
      } else {
        // Handle line element updated
      const updatedLine: ILine = {
        id: element.id,
        points: (element.data.points as number[]) || [],
        tool: (element.data.tool as Tool) || "pen",
        strokeWidth: (element.data.strokeWidth as number) || 3,
        color: (element.data.color as string) || "#000000",
      };
      setLines((prev) =>
        prev.map((line) => (line.id === element.id ? updatedLine : line))
      );
      }
    },
    onElementDeleted: (elementId) => {
      setLines((prev) => prev.filter((line) => line.id !== elementId));
      setTextElements(prev => prev.filter(text => text.id !== elementId));
    },
  });

  // Create frame broadcast function using element broadcasting
  const broadcastFrameUpdate = useCallback(
    (frame: FrameElement) => {
      if (
        broadcastElementUpdate &&
        frame.id &&
        frame.x !== undefined &&
        frame.y !== undefined &&
        frame.width &&
        frame.height
      ) {
        const frameElement = {
          id: frame.id,
          type: "frame" as const,
          data: {
            x: frame.x,
            y: frame.y,
            width: frame.width,
            height: frame.height,
            name: frame.name,
            frameType: frame.frameType,
            style: frame.style,
            metadata: frame.metadata,
            hierarchy: frame.hierarchy,
            createdBy: frame.createdBy,
            createdAt: frame.createdAt,
            updatedAt: frame.updatedAt,
            version: frame.version,
          },
          userId: session?.user?.id || "unknown",
          timestamp: Date.now(),
        };
        broadcastElementUpdate(frameElement);
      }
    },
    [broadcastElementUpdate, session?.user?.id]
  );

  const [cursors, setCursors] = useState<Record<string, Cursor>>({});
  const localUserId = useRef(
    "user-" + Math.random().toString(36).substr(2, 9)
  ).current;

  const [addBoardAction] = useMutation(ADD_BOARD_ACTION);
  const [undoBoardAction] = useMutation(UNDO_BOARD_ACTION);
  const [redoBoardAction] = useMutation(REDO_BOARD_ACTION);

  useSubscription(CURSOR_MOVEMENT, {
    variables: { boardId },
    skip: !boardId,
    onData: ({ data }) => {
      logger.debug({ subscriptionData: data }, "Cursor movement data received");
      const cursor = data.data?.cursorMovement;
      if (cursor && cursor.userId !== localUserId) {
        setCursors((prev) => ({
          ...prev,
          [cursor.userId]: { ...cursor, name: cursor.userId.substring(0, 5) },
        }));
      }
    },
  });

  useSubscription(BOARD_UPDATES, {
    variables: { boardId },
    skip: !boardId,
    onData: ({ data }) => {
      logger.debug({ subscriptionData: data }, "Board update data received");
      const updatedBoard = data.data?.boardUpdates;
      if (updatedBoard) {
        const allElements = updatedBoard.elements || [];

        // Filter drawing lines (non-sticky-note, non-frame, non-text elements)
        const lineElements = allElements
          .filter((el: { data: string }) => {
            const parsed =
              typeof el.data === "string" ? JSON.parse(el.data) : el.data;
            return parsed.type !== "sticky-note" && parsed.type !== "frame" && parsed.type !== "text";
          })
          .map((el: { data: string }) =>
            typeof el.data === "string" ? JSON.parse(el.data) : el.data
          );

        // Filter sticky notes
        const stickyNoteElements = allElements
          .filter((el: { data: string }) => {
            const parsed =
              typeof el.data === "string" ? JSON.parse(el.data) : el.data;
            return parsed.type === "sticky-note";
          })
          .map((el: { data: string }) =>
            typeof el.data === "string" ? JSON.parse(el.data) : el.data
          );

        // Filter frames
        const frameElements = allElements
          .filter((el: { data: string }) => {
            const parsed =
              typeof el.data === "string" ? JSON.parse(el.data) : el.data;
            return parsed.type === "frame";
          })
          .map((el: { data: string }) =>
            typeof el.data === "string" ? JSON.parse(el.data) : el.data
          );

        // Filter text elements
        const textElementElements = allElements
          .filter((el: { data: string }) => {
            const parsed =
              typeof el.data === "string" ? JSON.parse(el.data) : el.data;
            return parsed.type === "text";
          })
          .map((el: { data: string }) =>
            typeof el.data === "string" ? JSON.parse(el.data) : el.data
          );

        setLines(lineElements);
        setStickyNotes(stickyNoteElements);
        setFrames((prevFrames) => {
          const frameElementsStr = JSON.stringify(frameElements);
          const prevFramesStr = JSON.stringify(prevFrames);
          if (frameElementsStr !== prevFramesStr) {
            return frameElements;
          }
          return prevFrames;
        });
        setTextElements((prevTextElements) => {
          const textElementsStr = JSON.stringify(textElementElements);
          const prevTextElementsStr = JSON.stringify(prevTextElements);
          if (textElementsStr !== prevTextElementsStr) {
            return textElementElements;
          }
          return prevTextElements;
        });

        if (updatedBoard.history !== undefined) {
          setHistory(updatedBoard.history || []);
        }
        if (updatedBoard.historyIndex !== undefined) {
          setHistoryIndex(updatedBoard.historyIndex ?? 0);
        }
      }
    },
  });

  useEffect(() => {
    logger.debug(
      { initialData },
      "Checking for initial data to populate canvas"
    );
    if (initialData?.getBoard) {
      const allElements = initialData.getBoard.elements || [];

      // Filter drawing lines (non-sticky-note, non-frame, non-text elements)
      const lineElements = allElements
        .filter((el: { data: string }) => {
          const parsed =
            typeof el.data === "string" ? JSON.parse(el.data) : el.data;
          return parsed.type !== "sticky-note" && parsed.type !== "frame" && parsed.type !== "text";
        })
        .map((el: { data: string }) =>
          typeof el.data === "string" ? JSON.parse(el.data) : el.data
        );

      // Filter sticky notes
      const stickyNoteElements = allElements
        .filter((el: { data: string }) => {
          const parsed =
            typeof el.data === "string" ? JSON.parse(el.data) : el.data;
          return parsed.type === "sticky-note";
        })
        .map((el: { data: string }) =>
          typeof el.data === "string" ? JSON.parse(el.data) : el.data
        );

      // Filter frames
      const frameElements = allElements
        .filter((el: { data: string }) => {
          const parsed =
            typeof el.data === "string" ? JSON.parse(el.data) : el.data;
          return parsed.type === "frame";
        })
        .map((el: { data: string }) =>
          typeof el.data === "string" ? JSON.parse(el.data) : el.data
        );

      // Filter text elements
      const textElementElements = allElements
        .filter((el: { data: string }) => {
          const parsed =
            typeof el.data === "string" ? JSON.parse(el.data) : el.data;
          return parsed.type === "text";
        })
        .map((el: { data: string }) =>
          typeof el.data === "string" ? JSON.parse(el.data) : el.data
        );

      setLines(lineElements);
      setStickyNotes(stickyNoteElements);
      setFrames((prevFrames) => {
        const frameElementsStr = JSON.stringify(frameElements);
        const prevFramesStr = JSON.stringify(prevFrames);
        if (frameElementsStr !== prevFramesStr) {
          return frameElements;
        }
        return prevFrames;
      });
      setTextElements((prevTextElements) => {
        const textElementsStr = JSON.stringify(textElementElements);
        const prevTextElementsStr = JSON.stringify(prevTextElements);
        if (textElementsStr !== prevTextElementsStr) {
          return textElementElements;
        }
        return prevTextElements;
      });
      setHistory(initialData.getBoard.history || []);
      setHistoryIndex(initialData.getBoard.historyIndex ?? 0);
    }
  }, [initialData, setLines, setStickyNotes, setFrames, setTextElements, setHistory, setHistoryIndex]);

  // Fetch additional board metadata from API
  useEffect(() => {
    if (boardId) {
      fetchBoardMetadata(boardId).catch((error) => {
        logger.error(
          { error, boardId },
          "Failed to fetch board metadata from API"
        );
      });
    }
  }, [boardId, fetchBoardMetadata]);

  const handleSetLines = async (newLines: ILine[]) => {
    const drawnLine = newLines[newLines.length - 1];
    if (drawnLine && boardId) {
      try {
        const lineWithId = {
          ...drawnLine,
          id:
            drawnLine.id ||
            `line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };

        if (
          lineWithId.id &&
          lineWithId.points &&
          lineWithId.tool &&
          lineWithId.color &&
          typeof lineWithId.strokeWidth === "number"
        ) {
          broadcastDrawingComplete({
            id: lineWithId.id,
            points: lineWithId.points,
            tool: lineWithId.tool,
            color: lineWithId.color,
            strokeWidth: lineWithId.strokeWidth,
          });
        }

        const { data } = await addBoardAction({
          variables: {
            boardId,
            action: {
              type: "add",
              data: JSON.stringify(lineWithId),
            },
          },
        });
        if (data?.addBoardAction) {
          const allElements = data.addBoardAction.elements || [];
          const lineElements = allElements
            .filter((el: { data: string }) => {
              const parsed =
                typeof el.data === "string" ? JSON.parse(el.data) : el.data;
              return parsed.type !== "sticky-note";
            })
            .map((el: { data: string }) =>
              typeof el.data === "string" ? JSON.parse(el.data) : el.data
            );

          setLines(lineElements);
          setHistory(data.addBoardAction.history || []);
          setHistoryIndex(data.addBoardAction.historyIndex ?? 0);
          updateBoardTimestamp(boardId);
        }
      } catch (err) {
        logger.error({ err }, "Failed to add board action");
      }
    }
  };

  const handleErase = async (lineId: string) => {
    if (lineId && boardId) {
      try {
        const { data } = await addBoardAction({
          variables: {
            boardId,
            action: {
              type: "remove",
              data: JSON.stringify({ id: lineId }),
            },
          },
        });
        if (data?.addBoardAction) {
          const allElements = data.addBoardAction.elements || [];
          const lineElements = allElements
            .filter((el: { data: string }) => {
              const parsed =
                typeof el.data === "string" ? JSON.parse(el.data) : el.data;
              return parsed.type !== "sticky-note";
            })
            .map((el: { data: string }) =>
              typeof el.data === "string" ? JSON.parse(el.data) : el.data
            );

          setLines(lineElements);
          setHistory(data.addBoardAction.history || []);
          setHistoryIndex(data.addBoardAction.historyIndex ?? 0);
          updateBoardTimestamp(boardId);
        }
      } catch (err) {
        logger.error({ err }, "Failed to erase board action");
      }
    }
  };

  // Sticky Notes Handlers
  const handleStickyNoteAdd = useCallback(
    async (stickyNote: StickyNoteElement) => {
      if (boardId) {
        try {
          const { data } = await addBoardAction({
            variables: {
              boardId,
              action: {
                type: "add",
                data: JSON.stringify(stickyNote),
              },
            },
          });
          if (data?.addBoardAction) {
            const allElements = data.addBoardAction.elements || [];
            const stickyNoteElements = allElements
              .filter(
                (el: { type: string; data: string }) =>
                  (typeof el.data === "string" ? JSON.parse(el.data) : el.data)
                    .type === "sticky-note"
              )
              .map((el: { data: string }) =>
                typeof el.data === "string" ? JSON.parse(el.data) : el.data
              );
            setStickyNotes(stickyNoteElements);
            setHistory(data.addBoardAction.history || []);
            setHistoryIndex(data.addBoardAction.historyIndex ?? 0);
            updateBoardTimestamp(boardId);
          }
        } catch (err) {
          logger.error({ err }, "Failed to add sticky note");
        }
      }
    },
    [boardId, addBoardAction, updateBoardTimestamp, setStickyNotes, setHistory, setHistoryIndex]
  );

  const handleStickyNoteUpdate = useCallback(
    async (updatedStickyNote: StickyNoteElement) => {
      if (boardId) {
        try {
          const { data } = await addBoardAction({
            variables: {
              boardId,
              action: {
                type: "update",
                data: JSON.stringify(updatedStickyNote),
              },
            },
          });
          if (data?.addBoardAction) {
            const allElements = data.addBoardAction.elements || [];
            const stickyNoteElements = allElements
              .filter(
                (el: { type: string; data: string }) =>
                  (typeof el.data === "string" ? JSON.parse(el.data) : el.data)
                    .type === "sticky-note"
              )
              .map((el: { data: string }) =>
                typeof el.data === "string" ? JSON.parse(el.data) : el.data
              );
            setStickyNotes(stickyNoteElements);
            updateBoardTimestamp(boardId);
          }
        } catch (err) {
          logger.error({ err }, "Failed to update sticky note");
        }
      }
    },
    [boardId, addBoardAction, updateBoardTimestamp, setStickyNotes]
  );

  const handleStickyNoteDelete = useCallback(
    async (stickyNoteId: string) => {
      if (!stickyNoteId || !boardId) {
        logger.warn(
          { stickyNoteId, boardId },
          "Invalid sticky note delete request"
        );
        return;
      }

      logger.debug(
        { stickyNoteId, boardId },
        "Attempting to delete sticky note"
      );

      try {
        const { data } = await addBoardAction({
          variables: {
            boardId,
            action: {
              type: "remove",
              data: JSON.stringify({ id: stickyNoteId, type: "sticky-note" }),
            },
          },
        });
        if (data?.addBoardAction) {
          const allElements = data.addBoardAction.elements || [];
          const stickyNoteElements = allElements
            .filter(
              (el: { type: string; data: string }) =>
                (typeof el.data === "string" ? JSON.parse(el.data) : el.data)
                  .type === "sticky-note"
            )
            .map((el: { data: string }) =>
              typeof el.data === "string" ? JSON.parse(el.data) : el.data
            );
          setStickyNotes(stickyNoteElements);
          setHistory(data.addBoardAction.history || []);
          setHistoryIndex(data.addBoardAction.historyIndex ?? 0);
          updateBoardTimestamp(boardId);
          setSelectedStickyNote(null);
          logger.debug(
            { deletedId: stickyNoteId },
            "Sticky note deleted successfully"
          );
        }
      } catch (err) {
        logger.error(
          { error: err, stickyNoteId },
          "Failed to delete sticky note"
        );
      }
    },
    [boardId, addBoardAction, updateBoardTimestamp, setStickyNotes, setHistory, setHistoryIndex, setSelectedStickyNote]
  );

  // Frame Handlers
  const handleFrameAdd = useCallback(
    async (frame: FrameElement) => {
      if (boardId) {
        try {
          const { data } = await addBoardAction({
            variables: {
              boardId,
              action: {
                type: "add",
                data: JSON.stringify(frame),
              },
            },
          });
          if (data?.addBoardAction) {
            const allElements = data.addBoardAction.elements || [];
            const frameElements = allElements
              .filter(
                (el: { type: string; data: string }) =>
                  (typeof el.data === "string" ? JSON.parse(el.data) : el.data)
                    .type === "frame"
              )
              .map((el: { data: string }) =>
                typeof el.data === "string" ? JSON.parse(el.data) : el.data
              );

            setFrames((prevFrames) => {
              const frameElementsStr = JSON.stringify(frameElements);
              const prevFramesStr = JSON.stringify(prevFrames);
              if (frameElementsStr !== prevFramesStr) {
                return frameElements;
              }
              return prevFrames;
            });
            setHistory(data.addBoardAction.history || []);
            setHistoryIndex(data.addBoardAction.historyIndex ?? 0);
            updateBoardTimestamp(boardId);
          }
        } catch (err) {
          logger.error({ err }, "Failed to add frame");
        }
      }
    },
    [boardId, addBoardAction, updateBoardTimestamp, setFrames, setHistory, setHistoryIndex]
  );

  const handleFrameUpdate = useCallback(
    async (updatedFrame: FrameElement) => {
      if (boardId) {
        // 1. Optimistically update local state for immediate UI feedback
        setFrames((prev) =>
          prev.map((f) => (f.id === updatedFrame.id ? updatedFrame : f))
        );

        try {
          const { data } = await addBoardAction({
            variables: {
              boardId,
              action: {
                type: "update",
                data: JSON.stringify(updatedFrame),
              },
            },
          });
          if (data?.addBoardAction) {
            // 2. Sync state with server-confirmed data to ensure consistency
            const allElements = data.addBoardAction.elements || [];
            const frameElements = allElements
              .filter(
                (el: { type: string; data: string }) =>
                  (typeof el.data === "string" ? JSON.parse(el.data) : el.data)
                    .type === "frame"
              )
              .map((el: { data: string }) =>
                typeof el.data === "string" ? JSON.parse(el.data) : el.data
              );

            setFrames((prevFrames) => {
              const frameElementsStr = JSON.stringify(frameElements);
              const prevFramesStr = JSON.stringify(prevFrames);
              if (frameElementsStr !== prevFramesStr) {
                return frameElements;
              }
              return prevFrames;
            });
            updateBoardTimestamp(boardId);
          }
        } catch (err) {
          // 3. Revert optimistic update in case of failure
          setFrames((prev) =>
            prev.map((f) => (f.id === updatedFrame.id ? { ...f, ...updatedFrame } : f))
          );
          logger.error({ err }, "Failed to update frame");
        }
      }
    },
    [boardId, addBoardAction, updateBoardTimestamp, setFrames]
  );

  const handleFrameDelete = useCallback(
    async (frameId: string) => {
      if (!frameId || !boardId) {
        logger.warn({ frameId, boardId }, "Invalid frame delete request");
        return;
      }

      logger.debug({ frameId, boardId }, "Attempting to delete frame");

      try {
        const { data } = await addBoardAction({
          variables: {
            boardId,
            action: {
              type: "remove",
              data: JSON.stringify({ id: frameId, type: "frame" }),
            },
          },
        });
        if (data?.addBoardAction) {
          const allElements = data.addBoardAction.elements || [];
          const frameElements = allElements
            .filter(
              (el: { type: string; data: string }) =>
                (typeof el.data === "string" ? JSON.parse(el.data) : el.data)
                  .type === "frame"
            )
            .map((el: { data: string }) =>
              typeof el.data === "string" ? JSON.parse(el.data) : el.data
            );

          setFrames((prevFrames) => {
            const frameElementsStr = JSON.stringify(frameElements);
            const prevFramesStr = JSON.stringify(prevFrames);
            if (frameElementsStr !== prevFramesStr) {
              return frameElements;
            }
            return prevFrames;
          });
          setHistory(data.addBoardAction.history || []);
          setHistoryIndex(data.addBoardAction.historyIndex ?? 0);
          updateBoardTimestamp(boardId);
          setSelectedFrame(null);
          logger.debug({ deletedId: frameId }, "Frame deleted successfully");
        }
      } catch (err) {
        logger.error({ error: err, frameId }, "Failed to delete frame");
      }
    },
    [boardId, addBoardAction, updateBoardTimestamp, setFrames, setHistory, setHistoryIndex, setSelectedFrame]
  );

  const handleFrameDeleteMultiple = useCallback(
    async (frameIds: string[]) => {
      if (!frameIds.length || !boardId) {
        logger.warn({ frameIds, boardId }, "Invalid multiple frame delete request");
        return;
      }

      logger.debug({ frameIds, boardId }, "Attempting to delete multiple frames");

      try {
        for (const frameId of frameIds) {
          await addBoardAction({
            variables: {
              boardId,
              action: {
                type: "remove",
                data: JSON.stringify({ id: frameId, type: "frame" }),
              },
            },
          });
        }

        const { data } = await addBoardAction({
          variables: {
            boardId,
            action: {
              type: "sync",
              data: JSON.stringify({ sync: true }),
            },
          },
        });

        if (data?.addBoardAction) {
          const allElements = data.addBoardAction.elements || [];
          const frameElements = allElements
            .filter(
              (el: { type: string; data: string }) =>
                (typeof el.data === "string" ? JSON.parse(el.data) : el.data)
                  .type === "frame"
            )
            .map((el: { data: string }) =>
              typeof el.data === "string" ? JSON.parse(el.data) : el.data
            );

          setFrames(frameElements);
          setHistory(data.addBoardAction.history || []);
          setHistoryIndex(data.addBoardAction.historyIndex ?? 0);
          updateBoardTimestamp(boardId);
          setSelectedFrame(null);
          logger.debug({ deletedIds: frameIds }, "Multiple frames deleted successfully");
        }
      } catch (err) {
        logger.error({ error: err, frameIds }, "Failed to delete multiple frames");
      }
    },
    [boardId, addBoardAction, updateBoardTimestamp, setFrames, setHistory, setHistoryIndex, setSelectedFrame]
  );

  const handleFrameRename = useCallback(
    async (frameId: string, newName: string) => {
      if (!frameId || !newName.trim() || !boardId) {
        logger.warn({ frameId, newName, boardId }, "Invalid frame rename request");
        return;
      }

      logger.debug({ frameId, newName, boardId }, "Attempting to rename frame");

      try {
        const frameToUpdate = frames.find(f => f.id === frameId);
        if (!frameToUpdate) {
          logger.warn({ frameId }, "Frame not found for rename");
          return;
        }

        const updatedFrame = {
          ...frameToUpdate,
          name: newName.trim(),
          updatedAt: Date.now(),
          version: frameToUpdate.version + 1,
        };

        const { data } = await addBoardAction({
          variables: {
            boardId,
            action: {
              type: "update",
              data: JSON.stringify(updatedFrame),
            },
          },
        });

        if (data?.addBoardAction) {
          const allElements = data.addBoardAction.elements || [];
          const frameElements = allElements
            .filter(
              (el: { type: string; data: string }) =>
                (typeof el.data === "string" ? JSON.parse(el.data) : el.data)
                  .type === "frame"
            )
            .map((el: { data: string }) =>
              typeof el.data === "string" ? JSON.parse(el.data) : el.data
            );

          setFrames(frameElements);
          setHistory(data.addBoardAction.history || []);
          setHistoryIndex(data.addBoardAction.historyIndex ?? 0);
          updateBoardTimestamp(boardId);
          logger.debug({ frameId, newName }, "Frame renamed successfully");
        }
      } catch (err) {
        logger.error({ error: err, frameId, newName }, "Failed to rename frame");
      }
    },
    [boardId, addBoardAction, updateBoardTimestamp, frames, setFrames, setHistory, setHistoryIndex]
  );

  // Frame preset creation handler for FloatingFrameToolbar
  const handleFrameCreate = useCallback(
    (preset: {
      dimensions: { width: number; height: number };
      name: string;
      frameType: FrameElement["frameType"];
      defaultStyle: Partial<FrameElement["style"]>;
    }) => {
      const newFrame: FrameElement = {
        id: `frame-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "frame",
        x: 100,
        y: 100,
        width: preset.dimensions.width,
        height: preset.dimensions.height,
        name: preset.name,
        frameType: preset.frameType,
        style: {
          fill: "rgba(255, 255, 255, 0.8)",
          stroke: "#3b82f6",
          strokeWidth: 2,
          ...preset.defaultStyle,
        },
        metadata: {
          labels: [],
          tags: [],
          status: "draft",
          priority: "low",
          comments: [],
        },
        hierarchy: {
          childIds: [],
          level: 0,
          order: frames.length,
        },
        createdBy: session?.user?.id || "unknown",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      };

      handleFrameAdd(newFrame);
    },
    [handleFrameAdd, frames.length, session?.user?.id]
  );

  // Text Elements Handlers
  const handleTextElementAdd = useCallback(
    async (textElement: TextElement) => {
      if (boardId) {
        try {
          const { data } = await addBoardAction({
            variables: {
              boardId,
              action: {
                type: "add",
                data: JSON.stringify(textElement),
              },
            },
          });
          if (data?.addBoardAction) {
            const allElements = data.addBoardAction.elements || [];
            const textElementElements = allElements
              .filter(
                (el: { type: string; data: string }) =>
                  (typeof el.data === "string" ? JSON.parse(el.data) : el.data)
                    .type === "text"
              )
              .map((el: { data: string }) =>
                typeof el.data === "string" ? JSON.parse(el.data) : el.data
              );
            setTextElements(textElementElements);
            setHistory(data.addBoardAction.history || []);
            setHistoryIndex(data.addBoardAction.historyIndex ?? 0);
            updateBoardTimestamp(boardId);
            
            // Broadcast text element creation for real-time collaboration
            if (broadcastTextElementCreate) {
              broadcastTextElementCreate(textElement);
            }
          }
        } catch (err) {
          logger.error({ err }, "Failed to add text element");
        }
      }
    },
    [boardId, addBoardAction, updateBoardTimestamp, setTextElements, setHistory, setHistoryIndex, broadcastTextElementCreate]
  );

  const handleTextElementUpdate = useCallback(
    async (updatedTextElement: TextElement) => {
      if (boardId) {
        try {
          const { data } = await addBoardAction({
            variables: {
              boardId,
              action: {
                type: "update",
                data: JSON.stringify(updatedTextElement),
              },
            },
          });
          if (data?.addBoardAction) {
            const allElements = data.addBoardAction.elements || [];
            const textElementElements = allElements
              .filter(
                (el: { type: string; data: string }) =>
                  (typeof el.data === "string" ? JSON.parse(el.data) : el.data)
                    .type === "text"
              )
              .map((el: { data: string }) =>
                typeof el.data === "string" ? JSON.parse(el.data) : el.data
              );
            setTextElements(textElementElements);
            updateBoardTimestamp(boardId);
            
            // Broadcast text element update for real-time collaboration
            if (broadcastTextElementUpdate) {
              broadcastTextElementUpdate(updatedTextElement);
            }
          }
        } catch (err) {
          logger.error({ err }, "Failed to update text element");
        }
      }
    },
    [boardId, addBoardAction, updateBoardTimestamp, setTextElements, broadcastTextElementUpdate]
  );

  const handleTextElementDelete = useCallback(
    async (textElementId: string) => {
      if (!textElementId || !boardId) {
        logger.warn(
          { textElementId, boardId },
          "Invalid text element delete request"
        );
        return;
      }

      logger.debug(
        { textElementId, boardId },
        "Attempting to delete text element"
      );

      try {
        const { data } = await addBoardAction({
          variables: {
            boardId,
            action: {
              type: "remove",
              data: JSON.stringify({ id: textElementId, type: "text" }),
            },
          },
        });
        if (data?.addBoardAction) {
          const allElements = data.addBoardAction.elements || [];
          const textElementElements = allElements
            .filter(
              (el: { type: string; data: string }) =>
                (typeof el.data === "string" ? JSON.parse(el.data) : el.data)
                  .type === "text"
            )
            .map((el: { data: string }) =>
              typeof el.data === "string" ? JSON.parse(el.data) : el.data
            );
          setTextElements(textElementElements);
          setHistory(data.addBoardAction.history || []);
          setHistoryIndex(data.addBoardAction.historyIndex ?? 0);
          updateBoardTimestamp(boardId);
          setSelectedTextElement(null);
          setEditingTextElement(null);
          
          // Broadcast text element deletion for real-time collaboration
          if (broadcastTextElementDelete) {
            broadcastTextElementDelete(textElementId);
          }
          
          logger.debug(
            { deletedId: textElementId },
            "Text element deleted successfully"
          );
        }
      } catch (err) {
        logger.error(
          { error: err, textElementId },
          "Failed to delete text element"
        );
      }
    },
    [boardId, addBoardAction, updateBoardTimestamp, setTextElements, setHistory, setHistoryIndex, setSelectedTextElement, setEditingTextElement, broadcastTextElementDelete]
  );

  const handleTextElementSelect = useCallback(
    (textElementId: string) => {
      setSelectedTextElement(textElementId);
      setSelectedStickyNote(null);
      setSelectedFrame(null);
    },
    [setSelectedTextElement, setSelectedStickyNote, setSelectedFrame]
  );

  const handleTextElementStartEdit = useCallback(
    (textElementId: string) => {
      setEditingTextElement(textElementId);
      setSelectedTextElement(textElementId);
      
      // Broadcast text element edit start for real-time collaboration
      if (broadcastTextElementEditStart) {
        broadcastTextElementEditStart(textElementId);
      }
    },
    [setEditingTextElement, setSelectedTextElement, broadcastTextElementEditStart]
  );

  const handleTextElementFinishEdit = useCallback(() => {
    const currentEditingId = editingTextElement;
    setEditingTextElement(null);
    
    // Broadcast text element edit finish for real-time collaboration
    if (broadcastTextElementEditFinish && currentEditingId) {
      broadcastTextElementEditFinish(currentEditingId);
    }
  }, [setEditingTextElement, editingTextElement, broadcastTextElementEditFinish]);

  const handleTextElementDragStart = useCallback(() => {
    setIsDragInProgress(true);
  }, [setIsDragInProgress]);

  const handleTextElementDragEnd = useCallback(() => {
    setIsDragInProgress(false);
    setRecentDragEnd(true);
    
    // Clear the recent drag flag after a short delay
    setTimeout(() => {
      setRecentDragEnd(false);
    }, 150); // 150ms delay to prevent immediate canvas clicks
  }, [setIsDragInProgress, setRecentDragEnd]);

  // Enhanced canvas click handler with improved text element detection
  const handleCanvasClick = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (isDragInProgress || recentDragEnd) {
        logger.debug("Canvas click ignored due to drag state");
        return;
      }

      const targetName = e.target.getClassName();
      const isBackgroundClick =
        targetName === "Stage" || targetName === "Layer";

      if (!isBackgroundClick) {
        // Enhanced check for text element clicks
        if (e.target.hasName && e.target.hasName("text-element")) {
          logger.debug("Click detected on text element, allowing element to handle it");
          return;
        }

        // Check for sticky note clicks
        if (e.target.hasName && e.target.hasName("sticky-note")) {
          logger.debug("Click detected on sticky note, ignoring canvas click");
          return;
        }

        // Enhanced parent element checking with better text element detection
        let parent = e.target.getParent();
        while (parent) {
          if (parent.hasName) {
            if (parent.hasName("text-element")) {
              logger.debug("Click detected on text element (via parent), allowing element to handle it");
              return;
            }
            if (parent.hasName("sticky-note")) {
              logger.debug("Click detected on sticky note (via parent), ignoring canvas click");
              return;
            }
          }
          parent = parent.getParent();
        }

        // Check if the target is part of a text element by checking its ancestors
        const isPartOfTextElement = e.target.findAncestor && e.target.findAncestor('.text-element');
        if (isPartOfTextElement) {
          logger.debug("Click detected on text element component, allowing element to handle it");
          return;
        }
      }

      if (!isBackgroundClick) {
        return;
      }

      // Use setTimeout to allow text elements to handle their events first
      // This prevents race conditions where canvas click clears selection before text element can process it
      setTimeout(() => {
        if (tool === "sticky-note" && boardId && session?.user?.id) {
          const stage = e.target.getStage();
          const pointerPosition = stage?.getPointerPosition();
          if (pointerPosition && stage) {
            const transform = stage.getAbsoluteTransform().copy();
            transform.invert();
            const stagePos = transform.point(pointerPosition);

            const newStickyNote: StickyNoteElement = {
              id: `sticky-note-${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 9)}`,
              type: "sticky-note",
              x: stagePos.x,
              y: stagePos.y,
              width: 220,
              height: 160,
              text: "",
              color: currentStickyNoteColor,
              fontSize: 14,
              createdBy: session.user.id,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };

            handleStickyNoteAdd(newStickyNote);
            setSelectedStickyNote(newStickyNote.id);
            logger.debug(
              { newStickyNoteId: newStickyNote.id },
              "New sticky note created via canvas click"
            );
          }
        } else if (tool === "text" && boardId && session?.user?.id) {
          const stage = e.target.getStage();
          const pointerPosition = stage?.getPointerPosition();
          if (pointerPosition && stage) {
            const transform = stage.getAbsoluteTransform().copy();
            transform.invert();
            const stagePos = transform.point(pointerPosition);

            const newTextElement: TextElement = {
              id: `text-${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 9)}`,
              type: "text",
              x: stagePos.x,
              y: stagePos.y,
              width: 300,
              height: 48,
              text: "Type your text here...",
              formatting: {
                fontFamily: "Comic Sans MS",
                fontSize: 28,
                color: color,
                bold: false,
                italic: false,
                underline: false,
                strikethrough: false,
                highlight: false,
                highlightColor: "#ffeb3b",
                align: "left",
                lineHeight: 1.2,
                letterSpacing: 0,
                textTransform: "none",
                listType: "none",
                listStyle: "•",
                listLevel: 0,
              },
              style: {
                backgroundColor: "transparent",
                backgroundOpacity: 1,
                border: undefined,
                shadow: undefined,
                opacity: 1,
              },
              rotation: 0,
              isEditing: false,
              isSelected: false,
              createdBy: session.user.id,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              version: 1,
            };

            handleTextElementAdd(newTextElement);
            setSelectedTextElement(newTextElement.id);
            setEditingTextElement(newTextElement.id);
            logger.debug(
              { newTextElementId: newTextElement.id },
              "New text element created via canvas click"
            );
          }
        } else {
          // Clear all selections when clicking on background
          setSelectedStickyNote(null);
          setSelectedFrame(null);
          setSelectedTextElement(null);
          setEditingTextElement(null);
        }
      }, 0); // Minimal delay to allow text element handlers to fire first
    },
    [
      tool,
      boardId,
      session?.user?.id,
      handleStickyNoteAdd,
      currentStickyNoteColor,
      isDragInProgress,
      recentDragEnd,
      setSelectedStickyNote,
      handleTextElementAdd,
      color,
      setSelectedTextElement,
      setEditingTextElement,
    ]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    const timeoutId = dragTimeoutRef.current;
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const handleUndo = useCallback(async () => {
    logger.debug("Undo action triggered");
    if (boardId) {
      try {
        const { data } = await undoBoardAction({ variables: { boardId } });
        if (data?.undoBoardAction) {
          const allElements = data.undoBoardAction.elements || [];

          // Filter drawing lines (non-sticky-note, non-frame, non-text elements)
          const lineElements = allElements
            .filter((el: { data: string }) => {
              const parsed =
                typeof el.data === "string" ? JSON.parse(el.data) : el.data;
              return parsed.type !== "sticky-note" && parsed.type !== "frame" && parsed.type !== "text";
            })
            .map((el: { data: string }) =>
              typeof el.data === "string" ? JSON.parse(el.data) : el.data
            );

          // Filter sticky notes
          const stickyNoteElements = allElements
            .filter((el: { data: string }) => {
              const parsed =
                typeof el.data === "string" ? JSON.parse(el.data) : el.data;
              return parsed.type === "sticky-note";
            })
            .map((el: { data: string }) =>
              typeof el.data === "string" ? JSON.parse(el.data) : el.data
            );

          // Filter frames
          const frameElements = allElements
            .filter((el: { data: string }) => {
              const parsed =
                typeof el.data === "string" ? JSON.parse(el.data) : el.data;
              return parsed.type === "frame";
            })
            .map((el: { data: string }) =>
              typeof el.data === "string" ? JSON.parse(el.data) : el.data
            );

          // Filter text elements
          const textElementElements = allElements
            .filter((el: { data: string }) => {
              const parsed =
                typeof el.data === "string" ? JSON.parse(el.data) : el.data;
              return parsed.type === "text";
            })
            .map((el: { data: string }) =>
              typeof el.data === "string" ? JSON.parse(el.data) : el.data
            );

          setLines(lineElements);
          setStickyNotes(stickyNoteElements);
          setFrames((prevFrames) => {
            const frameElementsStr = JSON.stringify(frameElements);
            const prevFramesStr = JSON.stringify(prevFrames);
            if (frameElementsStr !== prevFramesStr) {
              return frameElements;
            }
            return prevFrames;
          });
          setTextElements(textElementElements);
          setHistory(data.undoBoardAction.history || []);
          setHistoryIndex(data.undoBoardAction.historyIndex ?? 0);
          updateBoardTimestamp(boardId);
          
          // Clear selections after undo
          setSelectedStickyNote(null);
          setSelectedFrame(null);
          setSelectedTextElement(null);
          setEditingTextElement(null);
        }
      } catch (err) {
        logger.error({ err }, "Failed to undo board action");
        toast.error("Failed to undo.");
      }
    }
  }, [boardId, undoBoardAction, updateBoardTimestamp, setLines, setStickyNotes, setFrames, setTextElements, setHistory, setHistoryIndex, setSelectedStickyNote, setSelectedFrame, setSelectedTextElement, setEditingTextElement]);

  const handleRedo = useCallback(async () => {
    logger.debug("Redo action triggered");
    if (boardId) {
      try {
        const { data } = await redoBoardAction({ variables: { boardId } });
        if (data?.redoBoardAction) {
          const allElements = data.redoBoardAction.elements || [];

          // Filter drawing lines (non-sticky-note, non-frame, non-text elements)
          const lineElements = allElements
            .filter((el: { data: string }) => {
              const parsed =
                typeof el.data === "string" ? JSON.parse(el.data) : el.data;
              return parsed.type !== "sticky-note" && parsed.type !== "frame" && parsed.type !== "text";
            })
            .map((el: { data: string }) =>
              typeof el.data === "string" ? JSON.parse(el.data) : el.data
            );

          // Filter sticky notes
          const stickyNoteElements = allElements
            .filter((el: { data: string }) => {
              const parsed =
                typeof el.data === "string" ? JSON.parse(el.data) : el.data;
              return parsed.type === "sticky-note";
            })
            .map((el: { data: string }) =>
              typeof el.data === "string" ? JSON.parse(el.data) : el.data
            );

          // Filter frames
          const frameElements = allElements
            .filter((el: { data: string }) => {
              const parsed =
                typeof el.data === "string" ? JSON.parse(el.data) : el.data;
              return parsed.type === "frame";
            })
            .map((el: { data: string }) =>
              typeof el.data === "string" ? JSON.parse(el.data) : el.data
            );

          // Filter text elements
          const textElementElements = allElements
            .filter((el: { data: string }) => {
              const parsed =
                typeof el.data === "string" ? JSON.parse(el.data) : el.data;
              return parsed.type === "text";
            })
            .map((el: { data: string }) =>
              typeof el.data === "string" ? JSON.parse(el.data) : el.data
            );

          setLines(lineElements);
          setStickyNotes(stickyNoteElements);
          setFrames((prevFrames) => {
            const frameElementsStr = JSON.stringify(frameElements);
            const prevFramesStr = JSON.stringify(prevFrames);
            if (frameElementsStr !== prevFramesStr) {
              return frameElements;
            }
            return prevFrames;
          });
          setTextElements(textElementElements);
          setHistory(data.redoBoardAction.history || []);
          setHistoryIndex(data.redoBoardAction.historyIndex ?? 0);
          updateBoardTimestamp(boardId);
          
          // Clear selections after redo
          setSelectedStickyNote(null);
          setSelectedFrame(null);
          setSelectedTextElement(null);
          setEditingTextElement(null);
        }
      } catch (err) {
        logger.error({ err }, "Failed to redo board action");
        toast.error("Failed to redo.");
      }
    }
  }, [boardId, redoBoardAction, updateBoardTimestamp, setLines, setStickyNotes, setFrames, setTextElements, setHistory, setHistoryIndex, setSelectedStickyNote, setSelectedFrame, setSelectedTextElement, setEditingTextElement]);

  const handleExport = useCallback(() => {
    logger.info("Export action triggered");
    if (stageRef.current) {
      const uri = stageRef.current.toDataURL({
        pixelRatio: 2,
        quality: 1,
      });
      const link = document.createElement("a");
      link.download = `cyperboard-${boardId}-${
        new Date().toISOString().split("T")[0]
      }.png`;
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [boardId]);

  const onlineUsers = Object.values(cursors).map((cursor) => ({
    id: cursor.userId,
    name: cursor.name || `User ${cursor.userId.substring(0, 5)}`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cursor.userId}`,
    email: "",
    isOnline: true,
  }));

  const currentUser = {
    id: localUserId,
    name: session?.user?.name || "You",
    avatar:
      session?.user?.image ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${localUserId}`,
    email: session?.user?.email || "",
    isOnline: true,
  };

  const filteredOnlineUsers = onlineUsers.filter((u) => u.id !== localUserId);

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Board link copied to clipboard!");
    } catch {
      toast("Board link copied to clipboard!");
    }
  }, []);

  const handleInviteCollaborators = useCallback(() => {
    setShowInviteModal(true);
  }, [setShowInviteModal]);

  const handleRenameBoard = useCallback(() => {
    if (initialData?.getBoard) {
      setShowRenameModal(true);
    }
  }, [initialData?.getBoard, setShowRenameModal]);

  const handleBoardRenamed = useCallback(
    (board: { id: string; name: string }) => {
      setRenamedBoard(board);
      setShowSuccessModal(true);
      updateBoardName(board.name);
      toast.success("Board renamed!");
    },
    [updateBoardName, setRenamedBoard, setShowSuccessModal]
  );

  const handleTogglePresentation = useCallback(() => {
    setIsPresentationMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.requestFullscreen?.();
        setIsSidebarOpen(false);
        setIsCollaborationOpen(false);
        setShowKeyboardShortcuts(false);
        toast.success("Entered presentation mode");
      } else {
        if (document.fullscreenElement) {
          document.exitFullscreen?.();
        }
        toast.success("Exited presentation mode");
      }
      return newMode;
    });
  }, [setIsPresentationMode, setIsSidebarOpen, setIsCollaborationOpen, setShowKeyboardShortcuts]);

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "z":
            e.preventDefault();
            if (e.shiftKey) {
              handleRedo();
            } else {
              handleUndo();
            }
            break;
          case "y":
            e.preventDefault();
            handleRedo();
            break;
          case "s":
            e.preventDefault();
            handleExport();
            break;
          case "/":
            e.preventDefault();
            handleShare();
            break;
          case "0":
            e.preventDefault();
            resetZoom();
            break;
          case "g":
            e.preventDefault();
            setShowGrid(!showGrid);
            break;
          case "=":
          case "+":
            e.preventDefault();
            zoomIn();
            break;
          case "-":
            e.preventDefault();
            zoomOut();
            break;
        }
      }

      switch (e.key) {
        case "v":
          if (e.metaKey) {
            e.preventDefault();
            setTool("select");
          }
          break;
        case "p":
          if (e.metaKey) {
            e.preventDefault();
            setTool("pen");
          }
          break;
        case "e":
          if (e.metaKey) {
            e.preventDefault();
            setTool("eraser");
          }
          break;
        case "s":
          if (e.metaKey && e.shiftKey) {
            e.preventDefault();
            setTool("sticky-note");
          }
          break;
        case "t":
          if (e.metaKey) {
            e.preventDefault();
            setTool("text");
          }
          break;
        case "c":
          if (e.metaKey && e.shiftKey && tool === "sticky-note") {
            e.preventDefault();
            colorPicker.openPicker(currentStickyNoteColor, {
              x: window.innerWidth / 2 - 150,
              y: window.innerHeight / 2 - 150,
            });
          }
          break;
        case "r":
          if (e.metaKey) {
            e.preventDefault();
            handleRenameBoard();
          }
          break;
        case "Escape":
          setIsSidebarOpen(false);
          setIsCollaborationOpen(false);
          setShowKeyboardShortcuts(false);
          setShowRenameModal(false);
          setSelectedStickyNote(null);
          setSelectedFrame(null);
          setSelectedTextElement(null);
          setEditingTextElement(null);
          break;
        case "?":
          setShowKeyboardShortcuts(!showKeyboardShortcuts);
          break;
        case "Delete":
        case "Backspace":
          if (selectedStickyNote) {
            e.preventDefault();
            logger.debug(
              { selectedStickyNote },
              "Deleting sticky note via keyboard"
            );
            handleStickyNoteDelete(selectedStickyNote);
            setSelectedStickyNote(null);
          } else if (selectedFrame) {
            e.preventDefault();
            logger.debug(
              { selectedFrame },
              "Deleting frame via keyboard"
            );
            handleFrameDelete(selectedFrame);
            setSelectedFrame(null);
          } else if (selectedTextElement) {
            e.preventDefault();
            logger.debug(
              { selectedTextElement },
              "Deleting text element via keyboard"
            );
            handleTextElementDelete(selectedTextElement);
            setSelectedTextElement(null);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    handleUndo,
    handleRedo,
    handleExport,
    handleShare,
    handleRenameBoard,
    showKeyboardShortcuts,
    showGrid,
    resetZoom,
    zoomIn,
    zoomOut,
    selectedStickyNote,
    selectedFrame,
    selectedTextElement,
    handleStickyNoteDelete,
    handleFrameDelete,
    handleTextElementDelete,
    tool,
    currentStickyNoteColor,
    colorPicker,
    setTool,
    setShowGrid,
    setIsSidebarOpen,
    setIsCollaborationOpen,
    setShowKeyboardShortcuts,
    setShowRenameModal,
    setSelectedStickyNote,
    setSelectedFrame,
    setSelectedTextElement,
    setEditingTextElement,
  ]);

  const handleClearCanvas = async () => {
    const toastId = toast("Are you sure you want to clear the entire canvas?", {
      duration: 8000,
      action: {
        label: "Clear",
        onClick: async () => {
          if (boardId) {
            try {
              const { data } = await addBoardAction({
                variables: {
                  boardId,
                  action: {
                    type: "clear",
                    data: JSON.stringify({}),
                  },
                },
              });
              if (data?.addBoardAction) {
                setLines([]);
                setStickyNotes([]);
                setFrames([]);
                setTextElements([]);
                setHistory(data.addBoardAction.history || []);
                setHistoryIndex(data.addBoardAction.historyIndex ?? 0);
                updateBoardTimestamp(boardId);
                
                // Clear all selections
                setSelectedStickyNote(null);
                setSelectedFrame(null);
                setSelectedTextElement(null);
                setEditingTextElement(null);
                
                toast.success("Canvas cleared! You can undo this action.");
              }
            } catch (err) {
              logger.error({ err }, "Failed to clear canvas");
              toast.error("Failed to clear canvas.");
            }
          }
          toast.dismiss(toastId);
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => toast.dismiss(toastId),
      },
    });
  };

  const handleAIAction = () => {
    // Placeholder for AI functionality
    toast.success("AI Assistant activated! 🤖", {
      description: "AI features are coming soon. Stay tuned for intelligent drawing assistance!",
      duration: 3000,
    });
    console.log("AI tool activated - ready for implementation");
  };

  if (loading) {
    return (
      <PageLoading
        title="Loading your board"
        description="Please wait while we prepare your canvas for collaboration"
        variant="default"
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-50 border-2 border-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">
            Oops! Something went wrong
          </h2>
          <p className="text-slate-600 mb-6">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <PageLoading
        title="Authenticating"
        description="Verifying your access to the board..."
        variant="default"
      />
    );
  }

  if (status === "unauthenticated") {
    window.location.href = "/login";
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col overflow-hidden">
      {/* Enhanced Header */}
      <CanvasHeader
        currentUser={currentUser}
        onlineUsers={filteredOnlineUsers}
        onShare={handleShare}
        onOpenCollaboration={() => setIsCollaborationOpen(true)}
        onInvite={handleInviteCollaborators}
        onRename={handleRenameBoard}
        onFitToScreen={() => fitToScreen(lines)}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
        onTogglePresentation={handleTogglePresentation}
        isPresentationMode={isPresentationMode}
        zoomLevel={currentZoom}
      />

      {/* Main Content */}
      <div className="flex flex-1 pt-16">
        {/* Desktop Sidebar - Enhanced */}
        <aside className="hidden lg:flex flex-col w-24 bg-white/90 backdrop-blur-sm border-r border-slate-200/60 shadow-sm z-10 transition-all duration-300 hover:w-28">
          <div className="flex-1 flex flex-col items-center py-6 space-y-4">
            {/* Main Toolbar */}
            <MainToolbar
              tool={tool}
              setToolAction={setTool}
              undoAction={handleUndo}
              redoAction={handleRedo}
              canUndo={canUndo}
              canRedo={canRedo}
              onExportAction={handleExport}
              onClearCanvasAction={handleClearCanvas}
              onAIAction={handleAIAction}
              vertical
            />
            {/* Separator when pen tool is active */}
            {tool === "pen" && (
              <div className="w-8 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
            )}
            {/* Pen Tools Badge - Mini version for sidebar */}
            {tool === "pen" && (
              <div className="flex flex-col items-center space-y-2 p-2 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200/60 shadow-sm">
                {/* Color indicator */}
                <div
                  className="w-8 h-8 rounded-lg border-2 border-white shadow-md ring-2 ring-indigo-200/60"
                  style={{ backgroundColor: color }}
                  title={`Color: ${color.toUpperCase()}`}
                />
                {/* Stroke width indicator */}
                <div className="flex flex-col items-center space-y-1">
                  <div
                    className="bg-slate-600 rounded-full"
                    style={{
                      width: Math.max(2, Math.min(strokeWidth * 0.8, 16)),
                      height: Math.max(2, Math.min(strokeWidth * 0.8, 16)),
                    }}
                  />
                  <span className="text-xs font-medium text-slate-600">
                    {strokeWidth}
                  </span>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            <aside className="fixed left-0 top-16 bottom-0 w-80 bg-white/95 backdrop-blur-xl border-r border-slate-200/60 z-50 lg:hidden overflow-y-auto shadow-2xl">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Drawing Tools
                </h3>
                <MainToolbar
                  tool={tool}
                  setToolAction={setTool}
                  undoAction={handleUndo}
                  redoAction={handleRedo}
                  canUndo={canUndo}
                  canRedo={canRedo}
                  onExportAction={handleExport}
                  onClearCanvasAction={handleClearCanvas}
                  onAIAction={handleAIAction}
                  vertical={false}
                />
              </div>
            </aside>
          </>
        )}

        {/* Canvas Area */}
        <main className="flex-1 relative">
          {/* Collaboration Panel */}
          {isCollaborationOpen && (
            <>
              <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                onClick={() => setIsCollaborationOpen(false)}
              />
              <div className="fixed right-0 top-16 bottom-0 w-80 bg-white/95 backdrop-blur-xl border-l border-slate-200/60 z-50 overflow-y-auto shadow-2xl">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-800">
                      Collaboration
                    </h3>
                    <button
                      onClick={() => setIsCollaborationOpen(false)}
                      className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <CollaborationPanel
                    users={[currentUser, ...filteredOnlineUsers]}
                    currentUserId={localUserId}
                    onInviteAction={handleInviteCollaborators}
                    boardOwner={session?.user?.name || "Owner"}
                    lastActivity={new Date().toISOString()}
                  />
                </div>
              </div>
            </>
          )}

          {/* Canvas */}
          <div className="absolute inset-0 z-5">
            <DrawingCanvas
              stageRef={stageRef}
              tool={tool}
              color={color}
              strokeWidth={strokeWidth}
              initialLines={lines}
              initialStickyNotes={stickyNotes}
              initialFrames={frames}
              initialTextElements={textElements}
              selectedStickyNote={selectedStickyNote}
              selectedFrame={selectedFrame}
              selectedTextElement={selectedTextElement}
              editingTextElement={editingTextElement}
              onDrawEndAction={handleSetLines}
              onEraseAction={handleErase}
              onStickyNoteAddAction={handleStickyNoteAdd}
              onStickyNoteUpdateAction={handleStickyNoteUpdate}
              onStickyNoteDeleteAction={handleStickyNoteDelete}
              onStickyNoteSelectAction={handleStickyNoteSelect}
              onStickyNoteDragStartAction={handleStickyNoteDragStart}
              onStickyNoteDragEndAction={handleStickyNoteDragEnd}
              onFrameAddAction={handleFrameAdd}
              onFrameUpdateAction={handleFrameUpdate}
              onFrameDeleteAction={handleFrameDelete}
              onFrameSelectAction={handleFrameSelect}
              onFrameDragStartAction={handleFrameDragStart}
              onFrameDragEndAction={handleFrameDragEnd}
              onTextElementAddAction={handleTextElementAdd}
              onTextElementUpdateAction={handleTextElementUpdate}
              onTextElementDeleteAction={handleTextElementDelete}
              onTextElementSelectAction={handleTextElementSelect}
              onTextElementStartEditAction={handleTextElementStartEdit}
              onTextElementFinishEditAction={handleTextElementFinishEdit}
              onTextElementDragStartAction={handleTextElementDragStart}
              onTextElementDragEndAction={handleTextElementDragEnd}
              onCanvasClickAction={handleCanvasClick}
              onToolChangeAction={setTool}
              cursors={realTimeCursors}
              moveCursorAction={broadcastCursorMovement}
              onRealTimeDrawingAction={(line: ILine) => {
                if (
                  line.id &&
                  line.points &&
                  line.tool &&
                  line.color &&
                  typeof line.strokeWidth === "number"
                ) {
                  broadcastDrawingStart({
                    id: line.id,
                    points: line.points,
                    tool: line.tool,
                    color: line.color,
                    strokeWidth: line.strokeWidth,
                  });
                }
              }}
              onRealTimeLineUpdateAction={(line: ILine) => {
                if (
                  line.id &&
                  line.points &&
                  line.tool &&
                  line.color &&
                  typeof line.strokeWidth === "number"
                ) {
                  broadcastDrawingUpdate({
                    id: line.id,
                    points: line.points,
                    tool: line.tool,
                    color: line.color,
                    strokeWidth: line.strokeWidth,
                  });
                }
              }}
              onRealTimeFrameAction={(frame: FrameElement) => {
                if (
                  frame.id &&
                  frame.x !== undefined &&
                  frame.y !== undefined &&
                  frame.width &&
                  frame.height
                ) {
                  broadcastFrameUpdate(frame);
                }
              }}
            />
          </div>

          {/* Drawing Toolbar */}
          <DrawingToolbar
            isActive={tool === "pen" || tool === "highlighter"}
            initialColor={color}
            onColorChange={setColor}
            initialStrokeWidth={strokeWidth}
            onStrokeWidthChange={setStrokeWidth}
            className="lg:left-28 lg:top-20 max-lg:hidden"
            initialTool={tool === "highlighter" ? "highlighter" : "pen"}
            onToolChange={(drawingTool) => {
              // Convert DrawingTool to Tool type and update
              setTool(drawingTool as Tool);
            }}
          />

          {/* Floating Sticky Note Toolbar */}
          <FloatingStickyNoteToolbar
            currentColor={currentStickyNoteColor}
            onColorChangeAction={setCurrentStickyNoteColor}
            onColorPickerOpenAction={(position) => {
              colorPicker.openPicker(currentStickyNoteColor, position);
            }}
            isVisible={tool === "sticky-note"}
          />

          {/* Floating Frame Toolbar */}
          <FloatingFrameToolbar
            isActive={tool === "frame" || selectedFrame !== null}
            selectedFrames={
              selectedFrame
                ? frames.filter((f) => f.id === selectedFrame)
                : []
            }
            selectedFrameIds={selectedFrame ? [selectedFrame] : []}
            onFrameUpdateAction={handleFrameUpdate}
            onFrameCreateAction={handleFrameCreate}
            onFrameDeleteAction={handleFrameDelete}
            onFrameDeleteMultipleAction={handleFrameDeleteMultiple}
            onFrameRenameAction={handleFrameRename}
            className="max-lg:hidden"
          />

          {/* Floating Text Toolbar */}
          {(selectedTextElement !== null || editingTextElement !== null || tool === "text") && (
            <div className="max-lg:hidden">
              <FloatingTextToolbar
                isActive={true}
                selectedTextElements={
                  selectedTextElement
                    ? textElements.filter((t) => t.id === selectedTextElement)
                    : editingTextElement
                    ? textElements.filter((t) => t.id === editingTextElement)
                    : []
                }
                onTextUpdateAction={handleTextElementUpdate}
                className="max-lg:hidden"
              />
            </div>
          )}
        </main>
      </div>

      {/* Enhanced Mobile Bottom Toolbar */}
           <div className="fixed bottom-0 left-0 right-0 lg:hidden z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/60 shadow-2xl">
        <div className="px-4 py-3 pb-safe">
          <MainToolbar
            tool={tool}
            setToolAction={setTool}
            undoAction={handleUndo}
            redoAction={handleRedo}
            canUndo={canUndo}
            canRedo={canRedo}
            onExportAction={handleExport}
            onClearCanvasAction={handleClearCanvas}
            onAIAction={handleAIAction}
            vertical={false}
          />
        </div>
      </div>

      {/* Keyboard Shortcuts Panel */}
      <KeyboardShortcuts
        show={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />

      {/* Help Toggle Button */}
      {!showKeyboardShortcuts && (
        <button
          onClick={() => setShowKeyboardShortcuts(true)}
          className="fixed z-45 bg-slate-900/80 hover:bg-slate-800/90 text-white rounded-full p-3 backdrop-blur-xl border border-slate-700/50 shadow-xl transition-all duration-300 hover:scale-110
                     bottom-4 left-4 lg:bottom-4 lg:left-4 
                     max-lg:bottom-32 max-lg:left-4 
                     max-sm:bottom-36 max-sm:left-4"
          title="Show keyboard shortcuts (?)"
        >
          <span className="text-lg">⌨️</span>
        </button>
      )}

      {/* Rename Board Modal */}
      <RenameBoardModal
        isOpen={showRenameModal}
        onCloseAction={() => setShowRenameModal(false)}
        onSuccessAction={handleBoardRenamed}
        board={
          initialData?.getBoard
            ? { id: initialData.getBoard.id, name: initialData.getBoard.name }
            : null
        }
      />

      {/* Invite Collaborators Modal */}
      <InviteCollaboratorsModal
        isOpen={showInviteModal}
        onCloseAction={() => setShowInviteModal(false)}
        boardId={boardId}
        boardName={initialData?.getBoard?.name || "Untitled Board"}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onCloseAction={() => setShowSuccessModal(false)}
        title="Board Renamed Successfully!"
        message="Your board has been renamed and is ready for continued collaboration."
        boardId={renamedBoard?.id}
        boardName={renamedBoard?.name}
      />

      {/* Sticky Note Color Picker */}
      {colorPicker.isOpen && (
        <StickyNoteColorPicker
          selectedColor={colorPicker.selectedColor}
          onColorSelectAction={(color: string) => {
            setCurrentStickyNoteColor(color);
            colorPicker.setSelectedColor(color);
          }}
          onCloseAction={colorPicker.closePicker}
          position={colorPicker.position}
        />
      )}
    </div>
  );
}