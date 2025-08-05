export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  cursor?: { x: number; y: number };
  isOnline: boolean;
}

export type Tool = "pen" | "eraser" | "select" | "sticky-note" | "frame" | "highlighter" | "text" | "shapes" | "ai";

export interface DrawingElement {
  id: string;
  type: 'path' | 'rectangle' | 'circle' | 'line' | 'text' | 'sticky-note' | 'frame';
  data: Record<string, unknown>;
  style: { stroke: string; strokeWidth: number; fill?: string };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StickyNoteElement {
  id: string;
  type: 'sticky-note';
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  color: string;
  fontSize: number;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface FrameElement {
  id: string;
  type: 'frame';
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  description?: string;
  frameType: 'basic' | 'workflow' | 'design' | 'organization' | 'presentation' | 'collaboration';
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
    status: 'draft' | 'review' | 'approved' | 'archived';
    assignedTo?: string;
    dueDate?: number;
    priority: 'low' | 'medium' | 'high' | 'urgent';
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

export interface TextElement {
  id: string;
  type: 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  // Rich text formatting
  formatting: {
    // Character-level formatting
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikethrough: boolean;
    highlight: boolean;
    highlightColor: string;
    
    // Font properties
    fontFamily: string;
    fontSize: number;
    color: string;
    
    // Paragraph-level formatting
    align: 'left' | 'center' | 'right' | 'justify';
    lineHeight: number;
    letterSpacing: number;
    textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    
    // Lists
    listType: 'none' | 'bullet' | 'numbered';
    listStyle: string; // bullet style or numbering format
    listLevel: number;
    
    // Advanced typography
    textShadow?: {
      color: string;
      blur: number;
      offsetX: number;
      offsetY: number;
    };
    textStroke?: {
      width: number;
      color: string;
    };
  };
  
  // Visual properties
  style: {
    // Background
    backgroundColor?: string;
    backgroundOpacity?: number;
    
    // Border
    border?: {
      width: number;
      color: string;
      style: 'solid' | 'dashed' | 'dotted';
      radius: number;
    };
    
    // Effects
    shadow?: {
      color: string;
      blur: number;
      offsetX: number;
      offsetY: number;
      opacity: number;
    };
    
    // Opacity
    opacity: number;
  };
  
  // Positioning and interaction
  rotation: number;
  isEditing: boolean;
  isSelected: boolean;
  
  // Metadata
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  version: number;
}

export interface BoardAction {
  type: string;
  data: string; // JSON string of the action
  timestamp: string;
}
export interface BoardInvitation {
  id: string;
  boardId: string;
  inviterUserId: string;
  inviteeEmail: string;
  invitationToken: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  message?: string;
  createdAt: Date;
  expiresAt: Date;
  acceptedAt?: Date;
}

export interface Board {
  id: string;
  name: string;
  elements: DrawingElement[];
  collaborators: User[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  history?: BoardAction[];
  historyIndex?: number;
  pendingInvitations?: BoardInvitation[];
}

export interface ILine {
  id?: string;
  points: number[];
  tool: Tool;
  strokeWidth: number;
  color: string;
  frameId?: string;
}

export interface ShapeElement {
  id: string;
  type: 'shape';
  
  // Position and dimensions
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  rotation: number;
  
  // Shape type and specific properties
  shapeType: 'rectangle' | 'circle' | 'ellipse' | 'polygon' | 'star' | 'wedge' | 'arc' | 'ring' | 'line' | 'arrow' | 'custom-path';
  
  // Shape-specific properties
  shapeData: {
    // For polygons
    sides?: number;
    
    // For stars
    innerRadius?: number;
    outerRadius?: number;
    numPoints?: number;
    
    // For lines and arrows
    points?: number[];
    tension?: number;
    
    // For arcs and wedges
    angle?: number;
    innerRadius?: number;
    outerRadius?: number;
    clockwise?: boolean;
    
    // For custom paths
    pathData?: string;
    
    // For ellipses
    radiusX?: number;
    radiusY?: number;
    
    // For arrows
    pointerLength?: number;
    pointerWidth?: number;
    pointerAtBeginning?: boolean;
    
    // Line properties
    lineCap?: 'butt' | 'round' | 'square';
    lineJoin?: 'bevel' | 'round' | 'miter';
    closed?: boolean;
  };
  
  // Visual styling
  style: {
    // Fill
    fill?: string;
    fillOpacity?: number;
    fillEnabled?: boolean;
    
    // Stroke
    stroke: string;
    strokeWidth: number;
    strokeOpacity?: number;
    strokeEnabled?: boolean;
    strokeDasharray?: number[];
    strokeLineCap?: 'butt' | 'round' | 'square';
    strokeLineJoin?: 'bevel' | 'round' | 'miter';
    
    // Effects
    shadow?: {
      color: string;
      blur: number;
      offsetX: number;
      offsetY: number;
      opacity: number;
      enabled: boolean;
    };
    
    // Gradients
    gradient?: {
      type: 'linear' | 'radial';
      colors: Array<{ color: string; offset: number }>;
      start?: { x: number; y: number };
      end?: { x: number; y: number };
      radius?: number;
      enabled: boolean;
    };
    
    // Pattern fills
    pattern?: {
      type: 'image' | 'video';
      src: string;
      repeat: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
      offset?: { x: number; y: number };
      scale?: { x: number; y: number };
      rotation?: number;
      enabled: boolean;
    };
    
    // Overall opacity
    opacity: number;
    
    // Blend mode
    globalCompositeOperation?: string;
    
    // Corner radius for rectangles
    cornerRadius?: number | number[];
  };
  
  // Interaction properties
  draggable: boolean;
  resizable: boolean;
  rotatable: boolean;
  selectable: boolean;
  locked: boolean;
  
  // Transform constraints
  constraints?: {
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    aspectRatio?: number;
    keepAspectRatio?: boolean;
    snapToGrid?: boolean;
    snapToGuides?: boolean;
  };
  
  // Grouping and hierarchy
  groupId?: string;
  parentId?: string;
  childIds?: string[];
  zIndex: number;
  
  // Animation properties (for future use)
  animation?: {
    type: 'none' | 'pulse' | 'rotate' | 'scale' | 'custom';
    duration: number;
    easing: string;
    loop: boolean;
    enabled: boolean;
  };
  
  // Metadata
  name?: string;
  description?: string;
  tags?: string[];
  category?: string;
  
  // Collaboration and versioning
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  version: number;
  
  // Real-time collaboration
  isBeingEdited?: boolean;
  editedBy?: string;
  lastEditedAt?: number;
}
