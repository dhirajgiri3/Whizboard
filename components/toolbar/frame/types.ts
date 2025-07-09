import { ReactNode } from "react";

export interface FrameElement {
  id: string;
  type: "frame";
  name: string;
  description?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  frameType: "basic" | "workflow" | "design" | "organization" | "presentation" | "collaboration";
  isCreating?: boolean;
  style: {
    fill?: string;
    fillOpacity?: number;
    stroke: string;
    strokeWidth: number;
    strokeOpacity?: number;
    strokeDasharray?: number[];
    cornerRadius?: number;
    shadow?: {
      color: string;
      blur: number;
      offsetX: number;
      offsetY: number;
      opacity: number;
    };
    gradient?: {
      type: 'linear' | 'radial';
      colors: Array<{ color: string; offset: number }>;
      angle?: number;
    };
    background?: {
      type: 'color' | 'image' | 'pattern';
      value: string;
      opacity?: number;
    };
    // Transform properties
    transform?: string;
    rotation?: number;
    // Effects
    blendMode?: string;
    brightness?: number;
    contrast?: number;
    saturation?: number;
  };
  layout?: {
    padding: { top: number; right: number; bottom: number; left: number };
    contentAlign: 'start' | 'center' | 'end';
    contentJustify: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
    autoResize: boolean;
    clipContent: boolean;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    aspectRatio?: number;
  };
  metadata: {
    labels: string[];
    tags: string[];
    status: "draft" | "review" | "approved" | "archived";
    assignedTo?: string;
    dueDate?: number;
    priority: "low" | "medium" | "high" | "urgent";
    comments: Array<{
      id: string;
      text: string;
      author: string;
      createdAt: number;
      resolved: boolean;
    }>;
  };
  hierarchy: {
    parentId?: string;
    childIds: string[];
    level: number;
    order: number;
  };
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  version: number;
}

export type FrameCategory = "device" | "social" | "print" | "web" | "custom" | "presentation";

export interface FramePreset {
  id: string;
  name: string;
  category: FrameCategory;
  dimensions: { width: number; height: number };
  aspectRatio?: number;
  icon: ReactNode;
  frameType: FrameElement["frameType"];
  defaultStyle: Partial<FrameElement["style"]>;
  description?: string;
  tags?: string[];
}

export interface CategoryInfo {
  label: string;
  icon: ReactNode;
  color: string;
  description: string;
}

export interface FramePlacementHandler {
  handleFramePlacement: (x: number, y: number) => void;
  isPlacementMode: boolean;
  selectedPreset: FramePreset | null;
  cancelPlacement: () => void;
}

export interface FloatingFrameToolbarProps {
  isActive: boolean;
  selectedFrames?: FrameElement[];
  selectedFrameIds?: string[];
  onFrameUpdateAction: (frame: FrameElement) => void | Promise<void>;
  onFrameCreateAction: (preset: FramePreset, x?: number, y?: number) => void | Promise<void>;
  onFrameDeleteAction?: (frameId: string) => void | Promise<void>;
  onFrameDeleteMultipleAction?: (frameIds: string[]) => void | Promise<void>;
  onFrameRenameAction?: (frameId: string, newName: string) => void | Promise<void>;
  onFrameDeselectAction?: () => void;
  className?: string;
  scale?: number;
  onFrameAlignAction?: (
    alignment: "left" | "center" | "right" | "top" | "middle" | "bottom"
  ) => void;
  onFrameDistributeAction?: (direction: "horizontal" | "vertical") => void;
  // New placement-related props
  onFramePlacementStart?: (preset: FramePreset, placementHandler: FramePlacementHandler) => void;
  onFramePlacementCancel?: () => void;
  isMobile?: boolean;
  isTablet?: boolean;
  isCollapsed?: boolean;
}