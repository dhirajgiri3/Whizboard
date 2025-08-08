"use client";

import dynamic from "next/dynamic";
import { useRef, useEffect, useCallback, useState, useMemo } from "react";
import { gql, useMutation, useSubscription, useQuery } from "@apollo/client";
import { useSession } from "next-auth/react";
import ExportModal from "@/components/ui/modal/ExportModal";
import ImportModal from "@/components/ui/modal/ImportModal";
import FileManagerModal from "@/components/ui/modal/FileManagerModal";
import MainToolbar from "@/components/toolbar/MainToolbar";
import FloatingStickyNoteToolbar from "@/components/toolbar/stickynote/FloatingStickyNoteToolbar";
import FloatingFrameToolbar from "@/components/toolbar/frame/FloatingFrameToolbar";
import FloatingTextToolbar from "@/components/toolbar/text/FloatingTextToolbar";
import FloatingShapesToolbar from "@/components/toolbar/shape/FloatingShapesToolbar";
import CollaborationPanel from "@/components/layout/CollaborationPanel";
import { useParams } from "next/navigation";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import logger from "@/lib/logger/logger";
import { LoadingOverlay } from "@/components/ui/loading/Loading";
import { X, AlertCircle, ChevronUp, ChevronDown } from "lucide-react";
import RenameBoardModal from "@/components/ui/modal/RenameBoardModal";
import InviteCollaboratorsModal from "@/components/ui/modal/InviteCollaboratorsModal";
import SuccessModal from "@/components/ui/modal/SuccessModal";
import { toast } from "sonner";
import CanvasHeader from "@/components/layout/header/utils/CanvasHeader";
import {
  BoardProvider,
  useBoardContext,
} from "@/lib/context/BoardContext";
import { useRealTimeCollaboration } from "@/hooks/useRealTimeCollaboration";
import {
  StickyNoteElement,
  FrameElement,
  ILine,
  Tool,
  TextElement,
  ShapeElement,
} from "@/types";
import { FramePreset } from "@/components/toolbar/frame/types";
import { EnhancedCursor } from "@/types";
import { getRandomStickyNoteColor } from "@/components/canvas/stickynote/StickyNote";
import StickyNoteColorPicker, {
  useStickyNoteColorPicker,
} from "@/components/ui/modal/StickyNoteColorPicker";
import { createDefaultTextElement } from "@/lib/utils/utils";

// Import hooks and components
import KeyboardShortcuts from "@/components/boardshortcuts/KeyboardShortcuts";
import DrawingToolbar from "@/components/toolbar/pen/DrawingToolbar";
import TextEditor from "@/components/canvas/text/TextEditor";

// Phase 2: Advanced Selection and Performance Components
import AdvancedSelectionManager from "@/components/canvas/selection/AdvancedSelectionManager";
import DragDropEnhancement from "@/components/canvas/drag/DragDropEnhancement";
import CanvasPerformanceOptimizer from "@/components/canvas/performance/CanvasPerformanceOptimizer";
import LineToolbar from "@/components/toolbar/line/LineToolbar";

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
  mutation AddBoardAction($boardId: String!, $action: String!) {
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
        <LoadingOverlay
         text="Loading Your Board Page" />
      </div>
    ),
  }
);

export default function BoardPage() {
  const params = useParams();
  const boardId = params.id as string;
  const { data: session } = useSession();

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
  const [shapes, setShapes] = useState<ShapeElement[]>([]);
  const [selectedStickyNote, setSelectedStickyNote] = useState<string | null>(
    null
  );
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null);
  const [selectedTextElement, setSelectedTextElement] = useState<string | null>(
    null
  );
  const [editingTextElement, setEditingTextElement] =
    useState<TextElement | null>(null);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [selectedShapes, setSelectedShapes] = useState<string[]>([]);
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
  const [renamedBoard, setRenamedBoard] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [currentStickyNoteColor, setCurrentStickyNoteColor] = useState(
    getRandomStickyNoteColor()
  );
  
  // User presence state
  const [userPresenceData, setUserPresenceData] = useState<Record<string, any>>({});
  
  // Phase 3 Modal States
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showFileManagerModal, setShowFileManagerModal] = useState(false);

  // Mobile and tablet responsive states
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isFloatingToolbarCollapsed, setIsFloatingToolbarCollapsed] =
    useState(false);
  const [lastTouchEnd, setLastTouchEnd] = useState(0);

  // Pending shape creation state for improved UX
  const [pendingShapeType, setPendingShapeType] = useState<string | null>(null);
  const [pendingShapeProps, setPendingShapeProps] =
    useState<Partial<ShapeElement> | null>(null);

  // Pending frame creation state for improved UX
  const [pendingFramePreset, setPendingFramePreset] = useState<FramePreset | null>(null);
  const [isFramePlacementMode, setIsFramePlacementMode] = useState(false);
  
  // Phase 2: Advanced Selection and Performance State
  const [selectionMode, setSelectionMode] = useState<'lasso' | 'marquee' | 'none'>('none');
  const [visibleElements, setVisibleElements] = useState<string[]>([]);

  const [lineStyle, setLineStyle] = useState({
    strokeDasharray: undefined as number[] | undefined,
    strokeLineCap: 'round' as 'butt' | 'round' | 'square',
    strokeLineJoin: 'round' as 'bevel' | 'round' | 'miter',
    tension: 0 as number,
  });
  const [arrowStyle, setArrowStyle] = useState<'none' | 'start' | 'end' | 'both'>('none');

  // Derived responsive state
  const isSmallScreen = isMobile || isTablet;

  // Responsive detection and setup
  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;

      setIsMobile(width < 768); // Mobile: < 768px
      setIsTablet(width >= 768 && width < 1024); // Tablet: 768px - 1024px

      // Auto-collapse floating toolbars on mobile
      if (width < 768) {
        setIsFloatingToolbarCollapsed(true);
        setShowKeyboardShortcuts(false);
      }
    };

    updateScreenSize();
    window.addEventListener("resize", updateScreenSize);
    window.addEventListener("orientationchange", () => {
      setTimeout(updateScreenSize, 100); // Delay to ensure orientation change is complete
    });

    return () => {
      window.removeEventListener("resize", updateScreenSize);
      window.removeEventListener("orientationchange", updateScreenSize);
    };
  }, []);

  // Prevent double-tap zoom on mobile
  useEffect(() => {
    const handleTouchEnd = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      setLastTouchEnd(now);
    };

    document.addEventListener("touchend", handleTouchEnd, { passive: false });
    return () => document.removeEventListener("touchend", handleTouchEnd);
  }, [lastTouchEnd]);

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

  const handleShapeSelect = useCallback(
    (
      id: string | null,
      e?: KonvaEventObject<MouseEvent>,
      multiSelect?: boolean
    ) => {
      if (!id) {
        setSelectedShape(null);
        setSelectedShapes([]);
        return;
      }

      if (multiSelect) {
        setSelectedShapes((prev) => {
          const isAlreadySelected = prev.includes(id);
          if (isAlreadySelected) {
            // Remove from selection
            const newSelection = prev.filter((shapeId) => shapeId !== id);
            setSelectedShape(newSelection.length > 0 ? newSelection[0] : null);
            return newSelection;
          } else {
            // Add to selection
            const newSelection = [...prev, id];
            setSelectedShape(id); // Set as primary selection
            return newSelection;
          }
        });
      } else {
        // Single selection - clear others
        setSelectedShape(id);
        setSelectedShapes([id]);
      }
    },
    []
  );

  const handleStickyNoteDragStart = useCallback(() => {
    // No-op for now
  }, []);

  const handleStickyNoteDragEnd = useCallback(() => {
    // No-op for now
  }, []);

  const handleFrameDragStart = useCallback(() => {
    // No-op for now
  }, []);

  const handleFrameDragEnd = useCallback(() => {
    // No-op for now
  }, []);

  const handleShapeDragStart = useCallback(() => {
    // No-op for now
  }, []);

  const handleShapeDragEnd = useCallback(() => {
    // No-op for now
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
    const pointer = stage.getPointerPosition() || {
      x: stage.width() / 2,
      y: stage.height() / 2,
    };

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
    const pointer = stage.getPointerPosition() || {
      x: stage.width() / 2,
      y: stage.height() / 2,
    };

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

  const fitToScreen = useCallback(() => {
    console.log('BoardPage fitToScreen called');
    if (!stageRef.current) {
      console.log('No stage ref available');
      return;
    }

    // Calculate bounding box of all content
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    // Check lines
    lines.forEach((line) => {
      if (line.points && Array.isArray(line.points)) {
        for (let i = 0; i < line.points.length; i += 2) {
          const x = line.points[i];
          const y = line.points[i + 1];
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    });

    // Check shapes
    shapes.forEach((shape) => {
      if (shape) {
        const shapeX = shape.x || 0;
        const shapeY = shape.y || 0;
        const shapeWidth = shape.width || 0;
        const shapeHeight = shape.height || 0;
        
        minX = Math.min(minX, shapeX);
        minY = Math.min(minY, shapeY);
        maxX = Math.max(maxX, shapeX + shapeWidth);
        maxY = Math.max(maxY, shapeY + shapeHeight);
      }
    });

    // Check sticky notes
    stickyNotes.forEach((note) => {
      if (note) {
        const noteX = note.x || 0;
        const noteY = note.y || 0;
        const noteWidth = note.width || 200;
        const noteHeight = note.height || 150;
        
        minX = Math.min(minX, noteX);
        minY = Math.min(minY, noteY);
        maxX = Math.max(maxX, noteX + noteWidth);
        maxY = Math.max(maxY, noteY + noteHeight);
      }
    });

    // Check frames
    frames.forEach((frame) => {
      if (frame) {
        const frameX = frame.x || 0;
        const frameY = frame.y || 0;
        const frameWidth = frame.width || 0;
        const frameHeight = frame.height || 0;
        
        minX = Math.min(minX, frameX);
        minY = Math.min(minY, frameY);
        maxX = Math.max(maxX, frameX + frameWidth);
        maxY = Math.max(maxY, frameY + frameHeight);
      }
    });

    // Check text elements
    textElements.forEach((textElement) => {
      if (textElement) {
        const textX = textElement.x || 0;
        const textY = textElement.y || 0;
        const textWidth = textElement.width || 0;
        const textHeight = textElement.height || 0;
        
        minX = Math.min(minX, textX);
        minY = Math.min(minY, textY);
        maxX = Math.max(maxX, textX + textWidth);
        maxY = Math.max(maxY, textY + textHeight);
      }
    });

    // If no content found, set default bounds
    if (
      minX === Infinity ||
      minY === Infinity ||
      maxX === -Infinity ||
      maxY === -Infinity
    ) {
      // No content on the board, set default bounds
      minX = 0;
      minY = 0;
      maxX = 1000;
      maxY = 1000;
    }

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const stageWidth = stageRef.current.width();
    const stageHeight = stageRef.current.height();

    if (contentWidth <= 0 || contentHeight <= 0) {
      // Set default scale if content has no area
      const defaultScale = 0.8;
      stageRef.current.scale({ x: defaultScale, y: defaultScale });
      stageRef.current.position({ x: 0, y: 0 });
      setCurrentZoom(Math.round(defaultScale * 100));
      stageRef.current.batchDraw();
      return;
    }

    const scaleX = stageWidth / contentWidth;
    const scaleY = stageHeight / contentHeight;
    const scale = Math.min(scaleX, scaleY) * 0.9; // 90% to leave some margin

    stageRef.current.scale({ x: scale, y: scale });
    stageRef.current.position({
      x: (stageWidth - contentWidth * scale) / 2 - minX * scale,
      y: (stageHeight - contentHeight * scale) / 2 - minY * scale,
    });

    setCurrentZoom(Math.round(scale * 100));
    stageRef.current.batchDraw();
    console.log('BoardPage fitToScreen completed successfully');
  }, [lines, shapes, stickyNotes, frames, textElements, stageRef, setCurrentZoom]);

  // Sticky Note Color Picker State
  const colorPicker = useStickyNoteColorPicker();

  // Add drag timeout reference
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  logger.info({ boardId }, "BoardPage loading");

  const {
    data: initialData,
    loading,
    error,
    refetch,
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
    if (initialData?.getBoard && session?.user?.email) {
      setIsOwner(initialData.getBoard.createdBy === session.user.id);
    }
      }, [initialData?.getBoard, session?.user?.email, setIsOwner]);

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
    broadcastShapeElementCreate,
    broadcastShapeElementUpdate,
    broadcastShapeElementDelete,
    updateAndBroadcastPresence,
  } = useRealTimeCollaboration({
    boardId,
    userId: session?.user?.id || "unknown",
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
      if (element.type === "text") {
        // Handle text element added
        const newTextElement: TextElement = {
          id: element.id,
          type: "text",
          ...(element.data as Omit<TextElement, "id" | "type">),
        };
        setTextElements((prev) => [...prev, newTextElement]);
      } else if (element.type === "shape") {
        // Handle shape element added
        const newShapeElement: ShapeElement = {
          id: element.id,
          type: "shape",
          ...(element.data as Omit<ShapeElement, "id" | "type">),
        };
        setShapes((prev) => [...prev, newShapeElement]);
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
      if (element.type === "text") {
        // Handle text element updated
        const updatedTextElement: TextElement = {
          id: element.id,
          type: "text",
          ...(element.data as Omit<TextElement, "id" | "type">),
        };
        setTextElements((prev) =>
          prev.map((text) =>
            text.id === element.id ? updatedTextElement : text
          )
        );
      } else if (element.type === "shape") {
        // Handle shape element updated
        const updatedShapeElement: ShapeElement = {
          id: element.id,
          type: "shape",
          ...(element.data as Omit<ShapeElement, "id" | "type">),
        };
        setShapes((prev) =>
          prev.map((shape) =>
            shape.id === element.id ? updatedShapeElement : shape
          )
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
      setTextElements((prev) => prev.filter((text) => text.id !== elementId));
      setShapes((prev) => prev.filter((shape) => shape.id !== elementId));
    },
    onUserPresenceUpdate: (presenceData) => {
      setUserPresenceData(prev => ({ ...prev, [presenceData.userId]: presenceData }));
    }
  });

  const [cursors, setCursors] = useState<Record<string, EnhancedCursor>>({});
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

        // Filter shapes
        const shapeElements = allElements
          .filter((el: { data: string }) => {
            const parsed =
              typeof el.data === "string" ? JSON.parse(el.data) : el.data;
            return parsed.type === "shape";
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
        setShapes((prevShapes) => {
          const shapeElementsStr = JSON.stringify(shapeElements);
          const prevShapesStr = JSON.stringify(prevShapes);
          if (shapeElementsStr !== prevShapesStr) {
            return shapeElements;
          }
          return prevShapes;
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

      // Filter shapes
      const shapeElements = allElements
        .filter((el: { data: string }) => {
          const parsed =
            typeof el.data === "string" ? JSON.parse(el.data) : el.data;
          return parsed.type === "shape";
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
      setShapes((prevShapes) => {
        const shapeElementsStr = JSON.stringify(shapeElements);
        const prevShapesStr = JSON.stringify(prevShapes);
        if (shapeElementsStr !== prevShapesStr) {
          return shapeElements;
        }
        return prevShapes;
      });
      setHistory(initialData.getBoard.history || []);
      setHistoryIndex(initialData.getBoard.historyIndex ?? 0);
    }
  }, [
    initialData,
    setLines,
    setStickyNotes,
    setFrames,
    setTextElements,
    setShapes,
    setHistory,
    setHistoryIndex,
  ]);

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
    if (!drawnLine || !boardId) {
      logger.warn({ drawnLine: !!drawnLine, boardId }, "Missing required data for handleSetLines");
      return;
    }

    try {
      const lineWithId = {
        ...drawnLine,
        id:
          drawnLine.id ||
          `line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
            const parsed =
              typeof el.data === "string" ? JSON.parse(el.data) : el.data;
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
      console.error("Detailed error in handleSetLines:", err);
      
      // Try to provide more specific error information
      if (err instanceof Error) {
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
      }
      
      // Check if it's a GraphQL error
      if (err && typeof err === 'object' && 'graphQLErrors' in err) {
        console.error("GraphQL errors:", (err as any).graphQLErrors);
      }
    }
  };

  const handleErase = async (lineId: string) => {
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
            const parsed =
              typeof el.data === "string" ? JSON.parse(el.data) : el.data;
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
            logger.warn({ parseError, element: el }, "Failed to parse element data in handleErase map");
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
        logger.warn({ timestampError }, "Failed to update board timestamp in handleErase");
      }
    } catch (err) {
      logger.error({ err, boardId, lineId }, "Failed to erase board action");
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
              action: JSON.stringify({
                type: "add",
                data: JSON.stringify(stickyNote),
              }),
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
    [
      boardId,
      addBoardAction,
      updateBoardTimestamp,
      setStickyNotes,
      setHistory,
      setHistoryIndex,
    ]
  );

  const handleStickyNoteUpdate = useCallback(
    async (updatedStickyNote: StickyNoteElement) => {
      if (boardId) {
        try {
          const { data } = await addBoardAction({
            variables: {
              boardId,
              action: JSON.stringify({
                type: "update",
                data: JSON.stringify(updatedStickyNote),
              }),
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
            action: JSON.stringify({
              type: "remove",
              data: JSON.stringify({ id: stickyNoteId, type: "sticky-note" }),
            }),
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
    [
      boardId,
      addBoardAction,
      updateBoardTimestamp,
      setStickyNotes,
      setHistory,
      setHistoryIndex,
      setSelectedStickyNote,
    ]
  );

  // Frame Handlers
  const handleFrameAdd = useCallback(
    async (frame: FrameElement) => {
      if (boardId) {
        try {
          const { data } = await addBoardAction({
            variables: {
              boardId,
              action: JSON.stringify({
                type: "add",
                data: JSON.stringify(frame),
              }),
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
    [
      boardId,
      addBoardAction,
      updateBoardTimestamp,
      setFrames,
      setHistory,
      setHistoryIndex,
    ]
  );

  const handleFrameUpdate = useCallback(
    async (updatedFrame: FrameElement) => {
      if (boardId) {
        // Optimistic update - update local state immediately for instant UI feedback
        setFrames((prevFrames) =>
          prevFrames.map((frame) =>
            frame.id === updatedFrame.id
              ? { ...updatedFrame, version: (frame.version || 0) + 1 }
              : frame
          )
        );

        try {
          const { data } = await addBoardAction({
            variables: {
              boardId,
              action: JSON.stringify({
                type: "update",
                data: JSON.stringify(updatedFrame),
              }),
            },
          });
          if (data?.addBoardAction) {
            // Sync with server response to ensure consistency
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
            updateBoardTimestamp(boardId);
          }
        } catch (err) {
          logger.error(
            { err },
            "Failed to update frame, reverting optimistic update"
          );
          // Revert optimistic update on error
          setFrames((prevFrames) =>
            prevFrames.map((frame) =>
              frame.id === updatedFrame.id
                ? { ...frame, version: (frame.version || 0) - 1 }
                : frame
            )
          );
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
            action: JSON.stringify({
              type: "remove",
              data: JSON.stringify({ id: frameId, type: "frame" }),
            }),
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

          logger.debug({ deletedId: frameId }, "Frame deleted successfully");
        }
      } catch (err) {
        logger.error({ error: err, frameId }, "Failed to delete frame");
      }
    },
    [
      boardId,
      addBoardAction,
      updateBoardTimestamp,
      setFrames,
      setHistory,
      setHistoryIndex,
      setSelectedFrame,
    ]
  );

  const handleFrameDeleteMultiple = useCallback(
    async (frameIds: string[]) => {
      if (!frameIds.length || !boardId) {
        logger.warn(
          { frameIds, boardId },
          "Invalid multiple frame delete request"
        );
        return;
      }

      logger.debug(
        { frameIds, boardId },
        "Attempting to delete multiple frames"
      );

      try {
        // Delete each frame
        for (const frameId of frameIds) {
          await addBoardAction({
            variables: {
              boardId,
              action: JSON.stringify({
                type: "remove",
                data: JSON.stringify({ id: frameId, type: "frame" }),
              }),
            },
          });
        }

        // Sync the board state
        const { data } = await addBoardAction({
          variables: {
            boardId,
            action: JSON.stringify({
              type: "sync",
              data: JSON.stringify({ sync: true }),
            }),
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

          logger.debug(
            { deletedIds: frameIds },
            "Multiple frames deleted successfully"
          );
        }
      } catch (err) {
        logger.error(
          { error: err, frameIds },
          "Failed to delete multiple frames"
        );
      }
    },
    [
      boardId,
      addBoardAction,
      updateBoardTimestamp,
      setFrames,
      setHistory,
      setHistoryIndex,
      setSelectedFrame,
    ]
  );

  const handleFrameRename = useCallback(
    async (frameId: string, newName: string) => {
      if (!frameId || !boardId || !newName.trim()) {
        logger.warn(
          { frameId, boardId, newName },
          "Invalid frame rename request"
        );
        return;
      }

      logger.debug({ frameId, newName }, "Attempting to rename frame");

      try {
        const frameToRename = frames.find((frame) => frame.id === frameId);
        if (!frameToRename) {
          logger.warn({ frameId }, "Frame not found for rename");
          return;
        }

        const updatedFrame: FrameElement = {
          ...frameToRename,
          name: newName.trim(),
          updatedAt: Date.now(),
          version: frameToRename.version + 1,
        };

        await handleFrameUpdate(updatedFrame);
        logger.debug({ frameId, newName }, "Frame renamed successfully");
      } catch (err) {
        logger.error(
          { error: err, frameId, newName },
          "Failed to rename frame"
        );
      }
    },
    [boardId, frames, handleFrameUpdate]
  );

  // Frame placement handlers
  const handleFramePlacementStart = useCallback(
    (preset: FramePreset) => {
      setPendingFramePreset(preset);
      setIsFramePlacementMode(true);

      // Change cursor to indicate frame placement mode
      if (document.body.style) {
        document.body.style.cursor = "crosshair";
      }

      logger.debug(
        { preset },
        "Frame preset selected, click on canvas to place"
      );
    },
    [setPendingFramePreset, setIsFramePlacementMode]
  );

  const handleFramePlacementCancel = useCallback(() => {
    setPendingFramePreset(null);
    setIsFramePlacementMode(false);

    // Reset cursor
    if (document.body.style) {
      document.body.style.cursor = "default";
    }

    logger.debug("Frame placement cancelled");
  }, [setPendingFramePreset, setIsFramePlacementMode]);

  // Helper function to create a frame from a preset at a specific position
  const createFrameFromPreset = useCallback(
    (x: number, y: number, preset: FramePreset) => {
      if (!boardId || !session?.user?.email || !preset) return null;

      const newFrame: FrameElement = {
        id: `frame-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "frame",
        x,
        y,
        width: preset.dimensions?.width || 300,
        height: preset.dimensions?.height || 200,
        name: preset.name || "New Frame",
        frameType: preset.frameType || "design",
        style: {
          fill: preset.defaultStyle?.fill || "rgba(255, 255, 255, 0.9)",
          stroke: preset.defaultStyle?.stroke || "#3b82f6",
          strokeWidth: preset.defaultStyle?.strokeWidth || 2,
          cornerRadius: preset.defaultStyle?.cornerRadius || 8,
          fillOpacity: preset.defaultStyle?.fillOpacity || 1,
          strokeOpacity: preset.defaultStyle?.strokeOpacity || 1,
          shadow: preset.defaultStyle?.shadow,
          ...preset.defaultStyle,
        },
        metadata: {
          labels: [],
          tags: preset.tags || [],
          status: "draft",
          priority: "low",
          comments: [],
        },
        hierarchy: {
          childIds: [],
          level: 0,
          order: frames.length,
        },
        createdBy: session.user.id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      };

      handleFrameAdd(newFrame);
      setSelectedFrame(newFrame.id);

      return newFrame;
    },
    [
      boardId,
      session?.user?.email,
      handleFrameAdd,
      setSelectedFrame,
      frames.length,
    ]
  );

  // Frame deselection handler
  const handleFrameDeselect = useCallback(() => {
    setSelectedFrame(null);
  }, []);

  // Frame alignment handler
  const handleFrameAlign = useCallback(
    async (alignment: string) => {
      if (!selectedFrame || !boardId) return;

      // For single frame, alignment doesn't make sense
      // This would be more useful with multiple selected frames
      logger.debug(
        { alignment, frameId: selectedFrame },
        "Frame alignment requested"
      );
    },
    [selectedFrame, boardId]
  );

  // Frame distribution handler
  const handleFrameDistribute = useCallback(
    async (direction: "horizontal" | "vertical") => {
      if (!selectedFrame || !boardId) return;

      // For single frame, distribution doesn't make sense
      // This would be more useful with multiple selected frames
      logger.debug(
        { direction, frameId: selectedFrame },
        "Frame distribution requested"
      );
    },
    [selectedFrame, boardId]
  );

  // Text Elements Handlers
  const handleTextElementAdd = useCallback(
    async (textElement: TextElement) => {
      if (boardId) {
        try {
          const { data } = await addBoardAction({
            variables: {
              boardId,
              action: JSON.stringify({
                type: "add",
                data: JSON.stringify(textElement),
              }),
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
    [
      boardId,
      addBoardAction,
      updateBoardTimestamp,
      setTextElements,
      setHistory,
      setHistoryIndex,
      broadcastTextElementCreate,
    ]
  );

  const handleTextElementUpdate = useCallback(
    async (updatedTextElement: TextElement) => {
      if (boardId) {
        try {
          const { data } = await addBoardAction({
            variables: {
              boardId,
              action: JSON.stringify({
                type: "update",
                data: JSON.stringify(updatedTextElement),
              }),
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
    [
      boardId,
      addBoardAction,
      updateBoardTimestamp,
      setTextElements,
      broadcastTextElementUpdate,
    ]
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
            action: JSON.stringify({
              type: "remove",
              data: JSON.stringify({ id: textElementId, type: "text" }),
            }),
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
    [
      boardId,
      addBoardAction,
      updateBoardTimestamp,
      setTextElements,
      setHistory,
      setHistoryIndex,
      setSelectedTextElement,
      setEditingTextElement,
      broadcastTextElementDelete,
    ]
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
    (textElement: TextElement) => {
      setEditingTextElement(textElement);
      setSelectedTextElement(textElement.id);

      // Broadcast text element edit start for real-time collaboration
      if (broadcastTextElementEditStart) {
        broadcastTextElementEditStart(textElement.id);
      }
    },
    [
      setEditingTextElement,
      setSelectedTextElement,
      broadcastTextElementEditStart,
    ]
  );

  const handleTextElementFinishEdit = useCallback(() => {
    const currentEditingId = editingTextElement?.id;
    setEditingTextElement(null);

    // Broadcast text element edit finish for real-time collaboration
    if (broadcastTextElementEditFinish && currentEditingId) {
      broadcastTextElementEditFinish(currentEditingId);
    }
  }, [
    setEditingTextElement,
    editingTextElement,
    broadcastTextElementEditFinish,
  ]);

  // Shape Management Handlers
  const handleShapeAdd = useCallback(
    async (shape: ShapeElement) => {
      if (boardId) {
        try {
          const { data } = await addBoardAction({
            variables: {
              boardId,
              action: JSON.stringify({
                type: "add",
                data: JSON.stringify(shape),
              }),
            },
          });
          if (data?.addBoardAction) {
            const allElements = data.addBoardAction.elements || [];
            const shapeElements = allElements
              .filter(
                (el: { type: string; data: string }) =>
                  (typeof el.data === "string" ? JSON.parse(el.data) : el.data)
                    .type === "shape"
              )
              .map((el: { data: string }) =>
                typeof el.data === "string" ? JSON.parse(el.data) : el.data
              );
            setShapes(shapeElements);
            setHistory(data.addBoardAction.history || []);
            setHistoryIndex(data.addBoardAction.historyIndex ?? 0);
            updateBoardTimestamp(boardId);

            // Broadcast shape creation for real-time collaboration
            if (broadcastShapeElementCreate) {
              broadcastShapeElementCreate(shape);
            }
          }
        } catch (err) {
          logger.error({ err }, "Failed to add shape");
        }
      }
    },
    [
      boardId,
      addBoardAction,
      updateBoardTimestamp,
      setShapes,
      setHistory,
      setHistoryIndex,
      broadcastShapeElementCreate,
    ]
  );

  const handleShapeUpdate = useCallback(
    async (updatedShape: ShapeElement) => {
      if (boardId) {
        // Optimistic update - update local state immediately for instant UI feedback
        setShapes((prevShapes) =>
          prevShapes.map((shape) =>
            shape.id === updatedShape.id
              ? { ...updatedShape, version: (shape.version || 0) + 1 }
              : shape
          )
        );

        // Broadcast shape update for real-time collaboration immediately
        if (broadcastShapeElementUpdate) {
          broadcastShapeElementUpdate(updatedShape);
        }

        try {
          const { data } = await addBoardAction({
            variables: {
              boardId,
              action: JSON.stringify({
                type: "update",
                data: JSON.stringify(updatedShape),
              }),
            },
          });
          if (data?.addBoardAction) {
            // Sync with server response to ensure consistency
            const allElements = data.addBoardAction.elements || [];
            const shapeElements = allElements
              .filter(
                (el: { type: string; data: string }) =>
                  (typeof el.data === "string" ? JSON.parse(el.data) : el.data)
                    .type === "shape"
              )
              .map((el: { data: string }) =>
                typeof el.data === "string" ? JSON.parse(el.data) : el.data
              );
            setShapes(shapeElements);
            updateBoardTimestamp(boardId);
          }
        } catch (err) {
          logger.error(
            { err },
            "Failed to update shape, reverting optimistic update"
          );
          // Revert optimistic update on error
          setShapes((prevShapes) =>
            prevShapes.map((shape) =>
              shape.id === updatedShape.id
                ? { ...shape, version: (shape.version || 0) - 1 }
                : shape
            )
          );
        }
      }
    },
    [
      boardId,
      addBoardAction,
      updateBoardTimestamp,
      setShapes,
      broadcastShapeElementUpdate,
    ]
  );

  const handleShapeDelete = useCallback(
    async (shapeId: string) => {
      if (!shapeId || !boardId) {
        logger.warn({ shapeId, boardId }, "Invalid shape delete request");
        return;
      }

      logger.debug({ shapeId, boardId }, "Attempting to delete shape");

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
            .filter(
              (el: { type: string; data: string }) =>
                (typeof el.data === "string" ? JSON.parse(el.data) : el.data)
                  .type === "shape"
            )
            .map((el: { data: string }) =>
              typeof el.data === "string" ? JSON.parse(el.data) : el.data
            );
          setShapes(shapeElements);
          setHistory(data.addBoardAction.history || []);
          setHistoryIndex(data.addBoardAction.historyIndex ?? 0);
          updateBoardTimestamp(boardId);
          setSelectedShape(null);
          setSelectedShapes([]);

          // Broadcast shape deletion for real-time collaboration
          if (broadcastShapeElementDelete) {
            broadcastShapeElementDelete(shapeId);
          }

          logger.debug({ deletedId: shapeId }, "Shape deleted successfully");
        }
      } catch (err) {
        logger.error({ error: err, shapeId }, "Failed to delete shape");
      }
    },
    [
      boardId,
      addBoardAction,
      updateBoardTimestamp,
      setShapes,
      setHistory,
      setHistoryIndex,
      setSelectedShape,
      setSelectedShapes,
      broadcastShapeElementDelete,
    ]
  );

  const handleShapeDeleteMultiple = useCallback(
    async (shapeIds: string[]) => {
      if (!shapeIds.length || !boardId) {
        logger.warn(
          { shapeIds, boardId },
          "Invalid multiple shape delete request"
        );
        return;
      }

      logger.debug(
        { shapeIds, boardId },
        "Attempting to delete multiple shapes"
      );

      try {
        // Delete each shape
        for (const shapeId of shapeIds) {
          await addBoardAction({
            variables: {
              boardId,
              action: JSON.stringify({
                type: "remove",
                data: JSON.stringify({ id: shapeId, type: "shape" }),
              }),
            },
          });

          // Broadcast shape deletion for real-time collaboration
          if (broadcastShapeElementDelete) {
            broadcastShapeElementDelete(shapeId);
          }
        }

        // Sync the board state
        const { data } = await addBoardAction({
          variables: {
            boardId,
            action: JSON.stringify({
              type: "sync",
              data: JSON.stringify({ sync: true }),
            }),
          },
        });

        if (data?.addBoardAction) {
          const allElements = data.addBoardAction.elements || [];
          const shapeElements = allElements
            .filter(
              (el: { type: string; data: string }) =>
                (typeof el.data === "string" ? JSON.parse(el.data) : el.data)
                  .type === "shape"
            )
            .map((el: { data: string }) =>
              typeof el.data === "string" ? JSON.parse(el.data) : el.data
            );
          setShapes(shapeElements);
          setHistory(data.addBoardAction.history || []);
          setHistoryIndex(data.addBoardAction.historyIndex ?? 0);
          updateBoardTimestamp(boardId);
          setSelectedShape(null);
          setSelectedShapes([]);

          logger.debug(
            { deletedIds: shapeIds },
            "Multiple shapes deleted successfully"
          );
        }
      } catch (err) {
        logger.error(
          { error: err, shapeIds },
          "Failed to delete multiple shapes"
        );
      }
    },
    [
      boardId,
      addBoardAction,
      updateBoardTimestamp,
      setShapes,
      setHistory,
      setHistoryIndex,
      setSelectedShape,
      setSelectedShapes,
      broadcastShapeElementDelete,
    ]
  );

  const handleShapeCreate = useCallback(
    (shapeType: string, props?: Partial<ShapeElement>) => {
      if (!boardId || !session?.user?.id) return;

      // Set pending shape creation instead of creating immediately
      setPendingShapeType(shapeType);
      setPendingShapeProps(props || null);

      // Change cursor to indicate shape placement mode
      if (document.body.style) {
        document.body.style.cursor = "crosshair";
      }

      logger.debug(
        { shapeType },
        "Shape type selected, click on canvas to place"
      );
    },
    [boardId, session?.user?.id]
  );

  // Helper function to actually create the shape at a specific position
  const createShapeAtPosition = useCallback(
    (
      x: number,
      y: number,
      shapeType: string,
      props?: Partial<ShapeElement>
    ) => {
      if (!boardId || !session?.user?.id) return null;

      const newShape: ShapeElement = {
        id: `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "shape",
        x,
        y,
        width: 100,
        height: 100,
        rotation: 0,
        shapeType: shapeType as ShapeElement["shapeType"],
        shapeData: {},
        style: {
          fill: "#ffffff",
          stroke: "#3b82f6",
          strokeWidth: 2,
          opacity: 1,
          fillOpacity: 1,
          strokeOpacity: 1,
          fillEnabled: true,
          strokeEnabled: true,
        },
        draggable: true,
        resizable: true,
        rotatable: true,
        selectable: true,
        locked: false,
        zIndex: 0,
        createdBy: session.user.id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
        ...props,
      };

      handleShapeAdd(newShape);
      setSelectedShape(newShape.id);
      setSelectedShapes([newShape.id]);

      return newShape;
    },
    [
      boardId,
      session?.user?.email,
      handleShapeAdd,
      setSelectedShape,
      setSelectedShapes,
    ]
  );

  // Shape alignment handler
  const handleShapeAlign = useCallback(
    async (alignment: string, shapeIds: string[]) => {
      if (!boardId || shapeIds.length < 2) return;

      try {
        const shapesToAlign = shapes.filter((shape) =>
          shapeIds.includes(shape.id)
        );
        if (shapesToAlign.length < 2) return;

        logger.debug({ alignment, shapeIds }, "Aligning shapes");

        // Calculate bounding box of all selected shapes
        let minX = Infinity,
          maxX = -Infinity,
          minY = Infinity,
          maxY = -Infinity;

        shapesToAlign.forEach((shape) => {
          const width = shape.width || 100;
          const height = shape.height || 100;
          minX = Math.min(minX, shape.x);
          maxX = Math.max(maxX, shape.x + width);
          minY = Math.min(minY, shape.y);
          maxY = Math.max(maxY, shape.y + height);
        });

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        // Align shapes based on alignment type
        for (const shape of shapesToAlign) {
          let newX = shape.x;
          let newY = shape.y;
          const width = shape.width || 100;
          const height = shape.height || 100;

          switch (alignment) {
            case "left":
              newX = minX;
              break;
            case "center-horizontal":
              newX = centerX - width / 2;
              break;
            case "right":
              newX = maxX - width;
              break;
            case "top":
              newY = minY;
              break;
            case "center-vertical":
              newY = centerY - height / 2;
              break;
            case "bottom":
              newY = maxY - height;
              break;
          }

          if (newX !== shape.x || newY !== shape.y) {
            const updatedShape: ShapeElement = {
              ...shape,
              x: newX,
              y: newY,
              updatedAt: Date.now(),
              version: shape.version + 1,
            };

            await handleShapeUpdate(updatedShape);
          }
        }

        toast.success(`Aligned ${shapesToAlign.length} shapes ${alignment}`);
        logger.debug(
          { alignment, count: shapesToAlign.length },
          "Shapes aligned successfully"
        );
      } catch (err) {
        logger.error(
          { error: err, alignment, shapeIds },
          "Failed to align shapes"
        );
        toast.error("Failed to align shapes");
      }
    },
    [boardId, shapes, handleShapeUpdate]
  );

  // Shape distribution handler
  const handleShapeDistribute = useCallback(
    async (distribution: string, shapeIds: string[]) => {
      if (!boardId || shapeIds.length < 3) return;

      try {
        const shapesToDistribute = shapes.filter((shape) =>
          shapeIds.includes(shape.id)
        );
        if (shapesToDistribute.length < 3) return;

        logger.debug({ distribution, shapeIds }, "Distributing shapes");

        // Sort shapes by position
        if (distribution === "horizontal") {
          shapesToDistribute.sort((a, b) => a.x - b.x);
        } else if (distribution === "vertical") {
          shapesToDistribute.sort((a, b) => a.y - b.y);
        }

        if (shapesToDistribute.length < 3) return;

        // Calculate total space and gap between shapes
        let totalSpace, startPos, endPos;
        const firstShape = shapesToDistribute[0];
        const lastShape = shapesToDistribute[shapesToDistribute.length - 1];

        if (distribution === "horizontal") {
          startPos = firstShape.x + (firstShape.width || 100);
          endPos = lastShape.x;
          totalSpace = endPos - startPos;
        } else {
          startPos = firstShape.y + (firstShape.height || 100);
          endPos = lastShape.y;
          totalSpace = endPos - startPos;
        }

        // Calculate total width/height of middle shapes
        let totalShapeSize = 0;
        for (let i = 1; i < shapesToDistribute.length - 1; i++) {
          const shape = shapesToDistribute[i];
          totalShapeSize +=
            distribution === "horizontal"
              ? shape.width || 100
              : shape.height || 100;
        }

        // Calculate gap between shapes
        const numGaps = shapesToDistribute.length - 1;
        const gapSize = (totalSpace - totalShapeSize) / (numGaps - 1);

        // Position middle shapes
        let currentPos = startPos;
        for (let i = 1; i < shapesToDistribute.length - 1; i++) {
          const shape = shapesToDistribute[i];
          let newX = shape.x;
          let newY = shape.y;
          const width = shape.width || 100;
          const height = shape.height || 100;

          if (distribution === "horizontal") {
            newX = currentPos;
            currentPos += width + gapSize;
          } else {
            newY = currentPos;
            currentPos += height + gapSize;
          }

          if (newX !== shape.x || newY !== shape.y) {
            const updatedShape: ShapeElement = {
              ...shape,
              x: newX,
              y: newY,
              updatedAt: Date.now(),
              version: shape.version + 1,
            };

            await handleShapeUpdate(updatedShape);
          }
        }

        toast.success(
          `Distributed ${shapesToDistribute.length} shapes ${distribution}ly`
        );
        logger.debug(
          { distribution, count: shapesToDistribute.length },
          "Shapes distributed successfully"
        );
      } catch (err) {
        logger.error(
          { error: err, distribution, shapeIds },
          "Failed to distribute shapes"
        );
        toast.error("Failed to distribute shapes");
      }
    },
    [boardId, shapes, handleShapeUpdate]
  );

  // Shape duplication handler
  const handleShapeDuplicate = useCallback(
    async (shapeIds: string[]) => {
      if (!boardId || !session?.user?.id || shapeIds.length === 0) return;

      try {
        logger.debug({ shapeIds }, "Duplicating shapes");

        const shapesToDuplicate = shapes.filter((shape) =>
          shapeIds.includes(shape.id)
        );
        const newShapeIds: string[] = [];

        for (const shape of shapesToDuplicate) {
          const duplicatedShape: ShapeElement = {
            ...shape,
            id: `shape-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}`,
            x: shape.x + 20, // Offset by 20px
            y: shape.y + 20,
            createdBy: session.user.id,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            version: 1,
          };

          await handleShapeAdd(duplicatedShape);
          newShapeIds.push(duplicatedShape.id);
        }

        // Select the duplicated shapes
        setSelectedShape(newShapeIds[0]);
        setSelectedShapes(newShapeIds);

        toast.success(
          `Duplicated ${shapesToDuplicate.length} shape${
            shapesToDuplicate.length > 1 ? "s" : ""
          }`
        );
        logger.debug(
          { originalIds: shapeIds, newIds: newShapeIds },
          "Shapes duplicated successfully"
        );
      } catch (err) {
        logger.error({ error: err, shapeIds }, "Failed to duplicate shapes");
        toast.error("Failed to duplicate shapes");
      }
    },
    [
      boardId,
      session?.user?.email,
      shapes,
      handleShapeAdd,
      setSelectedShape,
      setSelectedShapes,
    ]
  );

  const handleTextElementDragStart = useCallback(() => {
    // No-op for now
  }, []);

  const handleTextElementDragEnd = useCallback(() => {
    // No-op for now
  }, []);

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
          setSelectedShape(null);
          setSelectedShapes([]);
        }
      } catch (err) {
        logger.error({ err }, "Failed to undo board action");
        toast.error("Failed to undo.");
      }
    }
  }, [
    boardId,
    undoBoardAction,
    updateBoardTimestamp,
    setLines,
    setStickyNotes,
    setFrames,
    setTextElements,
    setHistory,
    setHistoryIndex,
    setSelectedStickyNote,
    setSelectedFrame,
    setSelectedTextElement,
    setEditingTextElement,
  ]);

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
          setSelectedShape(null);
          setSelectedShapes([]);
        }
      } catch (err) {
        logger.error({ err }, "Failed to redo board action");
        toast.error("Failed to redo.");
      }
    }
  }, [
    boardId,
    redoBoardAction,
    updateBoardTimestamp,
    setLines,
    setStickyNotes,
    setFrames,
    setTextElements,
    setHistory,
    setHistoryIndex,
    setSelectedStickyNote,
    setSelectedFrame,
    setSelectedTextElement,
    setEditingTextElement,
  ]);

  const handleExport = useCallback(() => {
    logger.info("Export action triggered");
    setShowExportModal(true);
  }, [setShowExportModal]);

  const handleImport = useCallback(() => {
    logger.info("Import action triggered");
    setShowImportModal(true);
  }, [setShowImportModal]);

  const handleFileManager = useCallback(() => {
    logger.info("File manager action triggered");
    setShowFileManagerModal(true);
  }, [setShowFileManagerModal]);

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

  const isExecutingRef = useRef(false);
  
  const handleTogglePresentation = useCallback(() => {
    console.log('handleTogglePresentation called');
    
    // Prevent rapid successive calls to avoid duplicate toast messages
    if (isExecutingRef.current) {
      console.log('handleTogglePresentation already executing, skipping');
      return;
    }
    
    isExecutingRef.current = true;
    
    // Reset flag after a short delay to allow future calls
    setTimeout(() => {
      isExecutingRef.current = false;
    }, 1000);
    
    setIsPresentationMode((prev) => {
      const newMode = !prev;
      console.log('Setting presentation mode to:', newMode);
      
      if (newMode) {
        // Enter presentation mode first
        setIsSidebarOpen(false);
        setIsCollaborationOpen(false);
        setShowKeyboardShortcuts(false);
        
        // Try to enter fullscreen mode with proper error handling
        const enterFullscreen = async () => {
          let toastShown = false;
          
          const showToast = (message: string, type: 'success' | 'info' = 'success') => {
            if (!toastShown) {
              if (type === 'success') {
                toast.success(message);
              } else {
                toast.info(message);
              }
              toastShown = true;
            }
          };
          
          // Check if fullscreen is supported
          if (!document.documentElement.requestFullscreen) {
            console.log('Fullscreen not supported by browser');
            showToast("Entered presentation mode (fullscreen not supported)");
            return;
          }
          
          // Check if already in fullscreen
          if (document.fullscreenElement) {
            console.log('Already in fullscreen mode');
            showToast("Entered presentation mode");
            return;
          }
          
          // Check if we're in a secure context (required for fullscreen)
          if (!window.isSecureContext) {
            console.log('Not in secure context - fullscreen not available');
            showToast("Entered presentation mode (fullscreen requires HTTPS)");
            return;
          }
          
          try {
            // Request fullscreen
            await document.documentElement.requestFullscreen();
            console.log('Successfully entered fullscreen');
            showToast("Entered presentation mode");
          } catch (error) {
            console.warn('Fullscreen request failed:', error);
            
            // Check specific error types and provide better user feedback
            if (error instanceof TypeError) {
              console.log('Fullscreen not supported or blocked');
              showToast("Entered presentation mode");
            } else if (error && typeof error === 'object' && 'name' in error && error.name === 'NotAllowedError') {
              console.log('Fullscreen blocked by user or browser policy');
              // Provide helpful message for user
              showToast("Presentation mode active (fullscreen blocked - try clicking the button again)", 'info');
            } else {
              console.log('Fullscreen failed for other reason:', error);
              showToast("Entered presentation mode");
            }
          }
        };
        
        // Execute fullscreen request
        enterFullscreen();
      } else {
        // Exit presentation mode
        console.log('Exiting presentation mode');
        try {
          if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch((error) => {
              console.warn('Exit fullscreen failed:', error);
            });
          }
        } catch (error) {
          console.warn('Exit fullscreen failed:', error);
        }
        
        toast.success("Exited presentation mode");
      }
      
      console.log('Presentation mode toggled successfully');
      return newMode;
    });
  }, [
    setIsPresentationMode,
    setIsSidebarOpen,
    setIsCollaborationOpen,
    setShowKeyboardShortcuts,
  ]);

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
          case "i":
            e.preventDefault();
            handleImport();
            break;
          case "f":
            e.preventDefault();
            handleFileManager();
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
          setSelectedShape(null);
          setSelectedShapes([]);
          break;
        case "?":
          setShowKeyboardShortcuts(!showKeyboardShortcuts);
          break;
        case "Delete":
        case "Backspace":
          // Check if user is currently editing text in any input/textarea
          if (
            document.activeElement &&
            (document.activeElement.tagName === "INPUT" ||
              document.activeElement.tagName === "TEXTAREA" ||
              document.activeElement.getAttribute("contenteditable") === "true" ||
              document.activeElement.hasAttribute("data-rename-input"))
          ) {
            // Don't interfere with text editing
            return;
          }

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
            logger.debug({ selectedFrame }, "Deleting frame via keyboard");
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
          } else if (selectedShapes.length > 0) {
            e.preventDefault();
            logger.debug({ selectedShapes }, "Deleting shapes via keyboard");
            if (selectedShapes.length === 1) {
              handleShapeDelete(selectedShapes[0]);
            } else {
              handleShapeDeleteMultiple(selectedShapes);
            }
            setSelectedShape(null);
            setSelectedShapes([]);
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
    selectedShapes,
    handleStickyNoteDelete,
    handleFrameDelete,
    handleTextElementDelete,
    handleShapeDelete,
    handleShapeDeleteMultiple,
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
    setSelectedShape,
    setSelectedShapes,
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
                  action: JSON.stringify({
                    type: "clear",
                    data: JSON.stringify({}),
                  }),
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
                setSelectedShape(null);
                setSelectedShapes([]);

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
    toast.success("AI Assistant activated!", {
      description:
        "AI features are coming soon. Stay tuned for intelligent drawing assistance!",
      duration: 3000,
    });
    console.log("AI tool activated - ready for implementation");
  };

  const handleCanvasClick = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      if (!stage) return;

      const pos = stage.getPointerPosition();
      if (!pos) return;

      // Convert pointer position to stage (canvas) coordinates
      const transform = stage.getAbsoluteTransform().copy();
      transform.invert();
      const stagePoint = transform.point(pos);

      /* ------------------------------------------------------------------ */
      /* Frame placement mode                                               */
      /* ------------------------------------------------------------------ */
      if (pendingFramePreset) {
        createFrameFromPreset(stagePoint.x, stagePoint.y, pendingFramePreset);
        setPendingFramePreset(null);
        setIsFramePlacementMode(false);
        document.body.style.cursor = "default";
        return;
      }

      /* ------------------------------------------------------------------ */
      /* Shape placement mode                                               */
      /* ------------------------------------------------------------------ */
      if (pendingShapeType) {
        createShapeAtPosition(
          stagePoint.x,
          stagePoint.y,
          pendingShapeType,
          pendingShapeProps || undefined
        );
        setPendingShapeType(null);
        setPendingShapeProps(null);
        document.body.style.cursor = "default";
        // Keep selection to newly created shape; createShapeAtPosition handles that.
        return;
      }

      /* ------------------------------------------------------------------ */
      /* Sticky-note tool                                                   */
      /* ------------------------------------------------------------------ */
      if (tool === "sticky-note") {
        const newSticky: StickyNoteElement = {
          id: `sticky-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: "sticky-note",
          x: stagePoint.x,
          y: stagePoint.y,
          width: 240,
          height: 240,
          text: "",
          color: currentStickyNoteColor,
          fontSize: 16,
          createdBy: session?.user?.id || "unknown",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        handleStickyNoteAdd(newSticky);
        setSelectedStickyNote(newSticky.id);
        // Keep the sticky note tool active for better UX
        return;
      }

      /* ------------------------------------------------------------------ */
      /* Text tool                                                          */
      /* ------------------------------------------------------------------ */
      if (tool === "text") {
        const newText: TextElement = {
          ...createDefaultTextElement({
            x: stagePoint.x,
            y: stagePoint.y,
          }),
          id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdBy: session?.user?.id || "unknown",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        handleTextElementAdd(newText);
        // Enter edit mode immediately after a small delay to ensure the element is created
        setTimeout(() => {
          handleTextElementStartEdit(newText);
        }, 100);
        return;
      }

      // Default: no special action
    },
    [
      pendingFramePreset,
      createFrameFromPreset,
      pendingShapeType,
      pendingShapeProps,
      createShapeAtPosition,
      setPendingShapeType,
      setPendingShapeProps,
      tool,
      currentStickyNoteColor,
      handleStickyNoteAdd,
      setSelectedStickyNote,
      setTool,
      session?.user?.email,
      handleTextElementAdd,
      handleTextElementStartEdit,
    ]
  );

  if (loading) {
    return (
      <LoadingOverlay
        text="Loading your board"
        subtitle="Please wait while we prepare your canvas for collaboration" 
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
      <LoadingOverlay
        text="Authenticating"
        subtitle="Verifying your access to the board..."
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
      {/* Enhanced Responsive Header */}
      <CanvasHeader
        currentUser={currentUser}
        onlineUsers={filteredOnlineUsers}
        onShare={handleShare}
        onOpenCollaboration={() => setIsCollaborationOpen(true)}
        onInvite={handleInviteCollaborators}
        onRename={handleRenameBoard}
        onExport={handleExport}
        onClearCanvas={handleClearCanvas}
        onFitToScreen={() => {
          console.log('Fit to screen button clicked');
          fitToScreen();
        }}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
        onTogglePresentation={() => {
          console.log('Presentation mode button clicked');
          handleTogglePresentation();
        }}
        onToggleGrid={() => setShowGrid(!showGrid)}
        isPresentationMode={isPresentationMode}
        showGrid={showGrid}
        zoomLevel={currentZoom}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      {/* Main Content - Responsive Layout */}
      <div className="flex flex-1 pt-16 relative">
        {/* Desktop Sidebar - Hidden on mobile/tablet */}
        <aside
          className={`
          hidden xl:flex flex-col bg-white/90 backdrop-blur-sm border-r border-slate-200/60 shadow-sm z-10 
          transition-all duration-300 hover:w-24
          ${isMobile || isTablet ? "w-0" : "w-20"}
        `}
        >
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
              onImportAction={handleImport}
              onFileManagerAction={handleFileManager}
              onClearCanvasAction={handleClearCanvas}
              onAIAction={handleAIAction}
              vertical
              isMobile={isMobile}
              isTablet={isTablet}
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

        {/* Mobile/Tablet Sidebar Overlay */}
        {isSidebarOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 xl:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            <aside
              className={`
              fixed left-0 top-16 bottom-0 bg-white/95 backdrop-blur-xl border-r border-slate-200/60 z-50 xl:hidden overflow-y-auto shadow-2xl
              ${isMobile ? "w-full" : "w-80"}
            `}
            >
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Drawing Tools
                  </h3>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                <MainToolbar
                  tool={tool}
                  setToolAction={setTool}
                  undoAction={handleUndo}
                  redoAction={handleRedo}
                  canUndo={canUndo}
                  canRedo={canRedo}
                  onExportAction={handleExport}
                  onImportAction={handleImport}
                  onFileManagerAction={handleFileManager}
                  onClearCanvasAction={handleClearCanvas}
                  onAIAction={handleAIAction}
                  vertical={false}
                  isMobile={isMobile}
                  isTablet={isTablet}
                />
              </div>
            </aside>
          </>
        )}

        {/* Canvas Area - Responsive */}
        <main className="flex-1 relative">
          {/* Collaboration Panel - Responsive */}
          {isCollaborationOpen && (
            <>
              <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                onClick={() => setIsCollaborationOpen(false)}
              />
              <div
                className={`
                fixed right-0 top-16 bottom-0 bg-white/95 backdrop-blur-xl border-l border-slate-200/60 z-50 overflow-y-auto shadow-2xl
                ${isMobile ? "w-full" : "w-80"}
              `}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-800">
                      Collaboration
                    </h3>
                    <button
                      onClick={() => setIsCollaborationOpen(false)}
                      className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <X size={20} />
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
              initialShapes={shapes}
              selectedStickyNote={selectedStickyNote}
              selectedFrame={selectedFrame}
              selectedTextElement={selectedTextElement}
              editingTextElement={editingTextElement}
              selectedShape={selectedShape}
              selectedShapes={selectedShapes}
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
              onShapeAddAction={handleShapeAdd}
              onShapeUpdateAction={handleShapeUpdate}
              onShapeDeleteAction={handleShapeDelete}
              onShapeSelectAction={handleShapeSelect}
              onShapeDragStartAction={handleShapeDragStart}
              onShapeDragEndAction={handleShapeDragEnd}
              onCanvasClickAction={handleCanvasClick}
              onToolChangeAction={setTool}
              cursors={realTimeCursors}
              moveCursorAction={broadcastCursorMovement}
              isFramePlacementMode={isFramePlacementMode}
              isMobile={isMobile}
              isTablet={isTablet}
              showGrid={showGrid}
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
                  broadcastElementUpdate({
                    id: frame.id,
                    type: "frame" as const,
                    data: frame as unknown as Record<string, unknown>,
                    userId: session?.user?.email || "unknown",
                    timestamp: Date.now(),
                  });
                }
              }}
            />
          </div>

          {/* Responsive Drawing Toolbar */}
          <DrawingToolbar
            isActive={tool === "pen" || tool === "highlighter"}
            initialColor={color}
            onColorChange={setColor}
            initialStrokeWidth={strokeWidth}
            onStrokeWidthChange={setStrokeWidth}
            className={`
              ${
                isMobile
                  ? "fixed bottom-20 left-1/2 transform -translate-x-1/2 w-[90vw] max-w-sm"
                  : isTablet
                  ? "fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[70vw] max-w-md"
                  : "xl:left-24 xl:top-20 max-xl:hidden"
              }
            `}
            initialTool={tool === "highlighter" ? "highlighter" : "pen"}
            currentTool={tool === "highlighter" ? "highlighter" : "pen"}
            onToolChange={(selectedTool) => {
              setTool(selectedTool);
            }}
            isMobile={isMobile}
            isTablet={isTablet}
          />

          {/* Responsive Floating Sticky Note Toolbar */}
          <FloatingStickyNoteToolbar
            currentColor={currentStickyNoteColor}
            onColorChangeAction={setCurrentStickyNoteColor}
            onColorPickerOpenAction={(position) => {
              colorPicker.openPicker(currentStickyNoteColor, position);
            }}
            isVisible={tool === "sticky-note"}
            isMobile={isMobile}
            isTablet={isTablet}
            isCollapsed={isFloatingToolbarCollapsed}
          />

          {/* Responsive Floating Frame Toolbar */}
          <FloatingFrameToolbar
            isActive={tool === "frame"}
            selectedFrames={
              selectedFrame ? frames.filter((f) => f.id === selectedFrame) : []
            }
            selectedFrameIds={selectedFrame ? [selectedFrame] : []}
            onFrameUpdateAction={handleFrameUpdate}
            onFrameCreateAction={(preset: FramePreset, x?: number, y?: number) => {
              if (x !== undefined && y !== undefined) {
                // Direct creation with coordinates
                createFrameFromPreset(x, y, preset);
              } else {
                // Start placement mode
                handleFramePlacementStart(preset);
              }
            }}
            onFrameDeleteAction={handleFrameDelete}
            onFrameDeleteMultipleAction={handleFrameDeleteMultiple}
            onFrameRenameAction={handleFrameRename}
            onFrameDeselectAction={handleFrameDeselect}
            onFrameAlignAction={handleFrameAlign}
            onFrameDistributeAction={handleFrameDistribute}
            onFramePlacementStart={handleFramePlacementStart}
            onFramePlacementCancel={handleFramePlacementCancel}
            className={`
              ${
                isMobile || isTablet
                  ? "max-w-[90vw] max-h-[60vh]"
                  : "max-xl:hidden"
              }
            `}
            isMobile={isMobile}
            isTablet={isTablet}
            isCollapsed={isFloatingToolbarCollapsed}
          />

          {/* Responsive Floating Text Toolbar */}
          {tool === "text" && (
            <div
              className={`${
                isMobile || isTablet ? "max-w-[90vw]" : "max-xl:hidden"
              }`}
            >
              <FloatingTextToolbar
                isActive={true}
                selectedTextElements={
                  editingTextElement
                    ? [editingTextElement]
                    : selectedTextElement
                    ? textElements.filter((el) => el.id === selectedTextElement)
                    : []
                }
                onTextUpdateAction={handleTextElementUpdate}
                className={`${
                  isMobile || isTablet ? "max-w-[90vw]" : "max-xl:hidden"
                }`}
                isMobile={isMobile}
                isTablet={isTablet}
              />
            </div>
          )}

          {/* Responsive Floating Shapes Toolbar */}
          <FloatingShapesToolbar
            isActive={tool === "shapes"}
            selectedShapes={
              selectedShapes.length > 0
                ? shapes.filter((s) => selectedShapes.includes(s.id))
                : []
            }
            selectedShapeIds={selectedShapes}
            onShapeUpdateAction={handleShapeUpdate}
            onShapeCreateAction={handleShapeCreate}
            onShapeDeleteAction={handleShapeDelete}
            onShapeDeleteMultipleAction={handleShapeDeleteMultiple}
            onShapeDeselectAction={() => {
              setSelectedShape(null);
              setSelectedShapes([]);
            }}
            onShapeAlignAction={handleShapeAlign}
            onShapeDistributeAction={handleShapeDistribute}
            onShapeDuplicateAction={handleShapeDuplicate}
            className={`
              ${
                isMobile || isTablet
                  ? "max-w-[90vw] max-h-[60vh]"
                  : "max-xl:hidden"
              }
            `}
            isMobile={isMobile}
            isTablet={isTablet}
            isCollapsed={isFloatingToolbarCollapsed}
          />

          {/* Phase 2: Advanced Selection Manager */}
          <AdvancedSelectionManager
            stageRef={stageRef}
            isActive={selectionMode !== 'none'}
            selectionMode={selectionMode}
            onSelectionChange={(selectedIds) => {
              // Handle multi-selection for different element types
              const shapeIds = selectedIds.filter(id => 
                shapes.some(shape => shape.id === id)
              );
              const frameIds = selectedIds.filter(id => 
                frames.some(frame => frame.id === id)
              );
              const textIds = selectedIds.filter(id => 
                textElements.some(text => text.id === id)
              );
              
              if (shapeIds.length > 0) {
                setSelectedShapes(shapeIds);
              }
              if (frameIds.length > 0) {
                setSelectedFrame(frameIds[0]);
              }
              if (textIds.length > 0) {
                setSelectedTextElement(textIds[0]);
              }
            }}
            onSelectionStart={() => {
              // Clear existing selections when starting new selection
              setSelectedShape(null);
              setSelectedShapes([]);
              setSelectedFrame(null);
              setSelectedTextElement(null);
            }}
            onSelectionEnd={() => {
              // Optional: Add any cleanup logic
            }}
            selectableElements={[
              ...shapes.map(shape => ({
                id: shape.id,
                x: shape.x,
                y: shape.y,
                width: shape.width || 100,
                height: shape.height || 100,
                type: 'shape',
              })),
              ...frames.map(frame => ({
                id: frame.id,
                x: frame.x,
                y: frame.y,
                width: frame.width,
                height: frame.height,
                type: 'frame',
              })),
              ...textElements.map(text => ({
                id: text.id,
                x: text.x,
                y: text.y,
                width: text.width,
                height: text.height,
                type: 'text',
              })),
            ]}
          />

          {/* Phase 2: Drag & Drop Enhancement */}
          <DragDropEnhancement
            stageRef={stageRef}
            isActive={tool === 'select'}
            onDragStart={(elementId, position) => {
              console.log('Drag started:', elementId, position);
            }}
            onDragMove={(elementId, position) => {
              console.log('Drag move:', elementId, position);
            }}
            onDragEnd={(elementId, position) => {
              console.log('Drag ended:', elementId, position);
            }}
            onDropZoneEnter={(zoneId) => {
              console.log('Entered drop zone:', zoneId);
            }}
            onDropZoneLeave={(zoneId) => {
              console.log('Left drop zone:', zoneId);
            }}
            onDropZoneDrop={(zoneId, elementId) => {
              console.log('Dropped on zone:', zoneId, elementId);
              // Handle different drop zone actions
              switch (zoneId) {
                case 'frame':
                  // Add element to frame
                  break;
                case 'canvas':
                  // Move element to canvas
                  break;
                case 'group':
                  // Group elements
                  break;
              }
            }}
          />

          {/* Phase 2: Canvas Performance Optimizer */}
          <CanvasPerformanceOptimizer isEnabled={true}>
            <div />
          </CanvasPerformanceOptimizer>

          {/* Phase 2: Line Toolbar */}
          <LineToolbar
            isActive={tool === 'line'}
            onLineStyleChange={(style) => {
              setLineStyle({
                strokeDasharray: style.strokeDasharray,
                strokeLineCap: style.strokeLineCap || 'round',
                strokeLineJoin: style.strokeLineJoin || 'round',
                tension: style.tension || 0,
              });
            }}
            onColorChange={setColor}
            onStrokeWidthChange={setStrokeWidth}
            onArrowStyleChange={setArrowStyle}
            initialColor={color}
            initialStrokeWidth={strokeWidth}
            className={`
              ${
                isMobile || isTablet
                  ? "max-w-[90vw] max-h-[60vh]"
                  : "max-xl:hidden"
              }
            `}
            isMobile={isMobile}
            isTablet={isTablet}
            isCollapsed={isFloatingToolbarCollapsed}
          />
        </main>
      </div>

      {/* Enhanced Mobile/Tablet Bottom Toolbar */}
      <div
        className={`
        fixed bottom-0 left-0 right-0 xl:hidden z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/60 shadow-2xl
        ${isMobile ? "pb-safe" : ""}
      `}
      >
        <div className={`px-4 ${isMobile ? "py-2" : "py-3"}`}>
          <MainToolbar
            tool={tool}
            setToolAction={setTool}
            undoAction={handleUndo}
            redoAction={handleRedo}
            canUndo={canUndo}
            canRedo={canRedo}
                            onExportAction={handleExport}
                onImportAction={handleImport}
                onFileManagerAction={handleFileManager}
                onClearCanvasAction={handleClearCanvas}
                onAIAction={handleAIAction}
            vertical={false}
            isMobile={isMobile}
            isTablet={isTablet}
          />
        </div>
      </div>

      {/* Mobile Floating Action Button for Toolbar Toggle */}
      {(isMobile || isTablet) && (
        <button
          onClick={() =>
            setIsFloatingToolbarCollapsed(!isFloatingToolbarCollapsed)
          }
          className={`
            fixed z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 backdrop-blur-xl shadow-xl transition-all duration-300 hover:scale-110
            ${isMobile ? "bottom-[calc(env(safe-area-inset-bottom)+80px)] right-4" : "bottom-4 right-4"}
          `}
          title={
            isFloatingToolbarCollapsed ? "Expand toolbars" : "Collapse toolbars"
          }
        >
          {isFloatingToolbarCollapsed ? (
            <ChevronUp size={20} />
          ) : (
            <ChevronDown size={20} />
          )}
        </button>
      )}

      {/* Keyboard Shortcuts Panel - Responsive */}
      <KeyboardShortcuts
        show={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      {/* Help Toggle Button - Responsive */}
      {!showKeyboardShortcuts && (
        <button
          onClick={() => setShowKeyboardShortcuts(true)}
          className={`
            fixed z-45 bg-slate-900/80 hover:bg-slate-800/90 h-12 w-12 flex items-center justify-center text-white rounded-full p-3 backdrop-blur-xl border border-slate-700/50 shadow-xl transition-all duration-300 hover:scale-110
            ${
              isMobile
                ? "bottom-[calc(env(safe-area-inset-bottom)+112px)] right-4"
                : isTablet
                ? "bottom-20 right-4"
                : "bottom-4 right-4 xl:bottom-4 xl:right-4"
            }
          `}
          title="Show keyboard shortcuts (?)"
        >
          <span className="text-lg">⌨️</span>
        </button>
      )}

      {/* Responsive Modals */}
      <RenameBoardModal
        isOpen={showRenameModal}
        onCloseAction={() => setShowRenameModal(false)}
        onSuccessAction={handleBoardRenamed}
        board={
          initialData?.getBoard
            ? { id: initialData.getBoard.id, name: initialData.getBoard.name }
            : null
        }
        isMobile={isMobile}
        isTablet={isTablet}
      />

      <InviteCollaboratorsModal
        isOpen={showInviteModal}
        onCloseAction={() => setShowInviteModal(false)}
        boardId={boardId}
        boardName={initialData?.getBoard?.name || "Untitled Board"}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onCloseAction={() => setShowSuccessModal(false)}
        title="Board Renamed Successfully!"
        message="Your board has been renamed and is ready for continued collaboration."
        boardId={renamedBoard?.id}
        boardName={renamedBoard?.name}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      {/* Sticky Note Color Picker - Responsive */}
      {colorPicker.isOpen && (
        <StickyNoteColorPicker
          selectedColor={colorPicker.selectedColor}
          onColorSelectAction={(color: string) => {
            setCurrentStickyNoteColor(color);
            colorPicker.setSelectedColor(color);
          }}
          onCloseAction={colorPicker.closePicker}
          position={colorPicker.position}
          isMobile={isMobile}
          isTablet={isTablet}
        />
      )}

      {/* Text Editor for mobile/tablet - positioned better */}
      {editingTextElement && (
        <div className={`absolute z-50 ${isSmallScreen ? "inset-4" : ""}`}>
          <TextEditor
            textElement={editingTextElement}
            onUpdateAction={handleTextElementUpdate}
            onFinishEditingAction={handleTextElementFinishEdit}
            isMobile={isMobile}
            isTablet={isTablet}
            isVisible={true} // TextEditor should be visible when editing
            stageScale={stageRef.current?.scaleX() || 1}
            stagePosition={stageRef.current?.position() || { x: 0, y: 0 }}
          />
        </div>
      )}

      {/* Phase 3 Modals */}
      <ExportModal 
        isOpen={showExportModal} 
        onClose={() => setShowExportModal(false)} 
        boardName={initialData?.getBoard?.name || "Untitled Board"}
        currentZoom={currentZoom}
        stagePosition={stageRef.current?.position() || { x: 0, y: 0 }}
        canvasBounds={stageRef.current ? {
          x: stageRef.current.x(),
          y: stageRef.current.y(),
          width: stageRef.current.width(),
          height: stageRef.current.height()
        } : undefined}
      />
      
      <ImportModal 
        isOpen={showImportModal} 
        onClose={() => setShowImportModal(false)} 
        onImportComplete={() => { 
          refetch(); 
          toast.success("Import completed successfully!"); 
        }} 
      />
      
      <FileManagerModal 
        isOpen={showFileManagerModal} 
        onClose={() => setShowFileManagerModal(false)} 
      />
    </div>
  );
}

