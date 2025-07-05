import { FrameElement } from '@/types';

// Constants for frame types
export const FRAME_TYPES = {
  BASIC: 'basic',
  WORKFLOW: 'workflow',
  DESIGN: 'design',
  ORGANIZATION: 'organization',
  PRESENTATION: 'presentation',
  COLLABORATION: 'collaboration',
} as const;

// Frame templates based on Frametools.md specifications
export const FRAME_TEMPLATES = {
  // Device frames
  'iphone-14': { width: 390, height: 844, name: 'iPhone 14', frameType: FRAME_TYPES.DESIGN },
  'iphone-14-pro': { width: 393, height: 852, name: 'iPhone 14 Pro', frameType: FRAME_TYPES.DESIGN },
  'android-phone': { width: 412, height: 915, name: 'Android Phone', frameType: FRAME_TYPES.DESIGN },
  'ipad': { width: 810, height: 1080, name: 'iPad', frameType: FRAME_TYPES.DESIGN },
  'tablet': { width: 768, height: 1024, name: 'Tablet', frameType: FRAME_TYPES.DESIGN },
  'desktop': { width: 1440, height: 900, name: 'Desktop', frameType: FRAME_TYPES.DESIGN },
  'smartwatch': { width: 198, height: 324, name: 'Smartwatch', frameType: FRAME_TYPES.DESIGN },
  'tv': { width: 1920, height: 1080, name: 'TV', frameType: FRAME_TYPES.DESIGN },

  // Social Media frames
  'instagram-post': { width: 1080, height: 1080, name: 'Instagram Post', frameType: FRAME_TYPES.DESIGN },
  'instagram-story': { width: 1080, height: 1920, name: 'Instagram Story', frameType: FRAME_TYPES.DESIGN },
  'facebook-cover': { width: 851, height: 315, name: 'Facebook Cover', frameType: FRAME_TYPES.DESIGN },
  'twitter-card': { width: 800, height: 418, name: 'Twitter Card', frameType: FRAME_TYPES.DESIGN },
  'linkedin-banner': { width: 1584, height: 396, name: 'LinkedIn Banner', frameType: FRAME_TYPES.DESIGN },
  'youtube-thumbnail': { width: 1280, height: 720, name: 'YouTube Thumbnail', frameType: FRAME_TYPES.DESIGN },

  // Print frames
  'business-card': { width: 1050, height: 600, name: 'Business Card', frameType: FRAME_TYPES.DESIGN },
  'a4-poster': { width: 2480, height: 3508, name: 'A4 Poster', frameType: FRAME_TYPES.DESIGN },
  'presentation-16-9': { width: 1920, height: 1080, name: 'Presentation 16:9', frameType: FRAME_TYPES.PRESENTATION },
  'presentation-4-3': { width: 1024, height: 768, name: 'Presentation 4:3', frameType: FRAME_TYPES.PRESENTATION },

  // Web frames
  'landing-page': { width: 1440, height: 1200, name: 'Landing Page', frameType: FRAME_TYPES.DESIGN },
  'email-template': { width: 600, height: 800, name: 'Email Template', frameType: FRAME_TYPES.DESIGN },
  'banner-ad': { width: 728, height: 90, name: 'Banner Ad', frameType: FRAME_TYPES.DESIGN },

  // Workflow frames
  'process-flow': { width: 800, height: 400, name: 'Process Flow', frameType: FRAME_TYPES.WORKFLOW },
  'decision-tree': { width: 600, height: 800, name: 'Decision Tree', frameType: FRAME_TYPES.WORKFLOW },
  'swimlanes': { width: 1000, height: 600, name: 'Swimlanes', frameType: FRAME_TYPES.WORKFLOW },

  // Organization frames
  'section-divider': { width: 1200, height: 100, name: 'Section Divider', frameType: FRAME_TYPES.ORGANIZATION },
  'category-container': { width: 500, height: 500, name: 'Category Container', frameType: FRAME_TYPES.ORGANIZATION },

  // Collaboration frames
  'comment-zone': { width: 300, height: 400, name: 'Comment Zone', frameType: FRAME_TYPES.COLLABORATION },
  'review-area': { width: 800, height: 600, name: 'Review Area', frameType: FRAME_TYPES.COLLABORATION },
};

/**
 * Create a new frame with default properties
 */
export function createFrame(options: Partial<FrameElement> = {}): FrameElement {
  const now = Date.now();
  const frameId = `frame-${now}-${Math.random().toString(36).substring(2, 9)}`;
  
  return {
    id: frameId,
    type: 'frame',
    x: options.x || 100,
    y: options.y || 100,
    width: options.width || 300,
    height: options.height || 200,
    name: options.name || 'Untitled Frame',
    frameType: options.frameType || FRAME_TYPES.BASIC,
    style: {
      fill: 'rgba(255, 255, 255, 0.8)',
      stroke: '#3b82f6',
      strokeWidth: 2,
      cornerRadius: 0,
      ...options.style,
    },
    metadata: {
      labels: [],
      tags: [],
      status: 'draft',
      priority: 'low',
      comments: [],
      ...options.metadata,
    },
    hierarchy: {
      childIds: [],
      level: 0,
      order: 0,
      ...options.hierarchy,
    },
    createdBy: options.createdBy || 'current-user',
    createdAt: now,
    updatedAt: now,
    version: 1,
  };
}

/**
 * Create a frame from a template
 */
export function createFrameFromTemplate(
  templateKey: keyof typeof FRAME_TEMPLATES,
  x: number,
  y: number,
  customOptions: Partial<FrameElement> = {}
): FrameElement {
  const template = FRAME_TEMPLATES[templateKey];
  
  if (!template) {
    throw new Error(`Template ${templateKey} not found`);
  }
  
  return createFrame({
    ...template,
    x,
    y,
    ...customOptions,
  });
}

/**
 * Create a duplicated frame with a new ID
 */
export function duplicateFrame(frame: FrameElement, offsetX = 20, offsetY = 20): FrameElement {
  const now = Date.now();
  return {
    ...frame,
    id: `frame-${now}-${Math.random().toString(36).substring(2, 9)}`,
    x: frame.x + offsetX,
    y: frame.y + offsetY,
    name: `${frame.name} (Copy)`,
    createdAt: now,
    updatedAt: now,
    version: 1,
  };
}

/**
 * Check if a point is inside a frame
 */
export function isPointInFrame(point: { x: number; y: number }, frame: FrameElement): boolean {
  return (
    point.x >= frame.x &&
    point.x <= frame.x + frame.width &&
    point.y >= frame.y &&
    point.y <= frame.y + frame.height
  );
}

/**
 * Group frames by automatically creating a parent frame that contains them
 */
export function createGroupFromFrames(frames: FrameElement[], groupName?: string): FrameElement {
  if (frames.length === 0) {
    throw new Error('Cannot create group from empty frames array');
  }
  
  // Find the bounding box of all frames
  let minX = Number.MAX_VALUE;
  let minY = Number.MAX_VALUE;
  let maxX = Number.MIN_VALUE;
  let maxY = Number.MIN_VALUE;
  
  frames.forEach(frame => {
    minX = Math.min(minX, frame.x);
    minY = Math.min(minY, frame.y);
    maxX = Math.max(maxX, frame.x + frame.width);
    maxY = Math.max(maxY, frame.y + frame.height);
  });
  
  // Add padding
  const padding = 20;
  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;
  
  // Create parent frame
  const now = Date.now();
  const childIds = frames.map(frame => frame.id);
  
  return createFrame({
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
    name: groupName || `Group (${frames.length} frames)`,
    frameType: FRAME_TYPES.ORGANIZATION,
    style: {
      fill: 'rgba(249, 250, 251, 0.6)',
      stroke: '#64748b',
      strokeWidth: 2,
      strokeDasharray: [5, 5],
      cornerRadius: 8,
    },
    hierarchy: {
      childIds,
      level: 0,
      order: 0,
    },
    createdAt: now,
    updatedAt: now,
  });
}

/**
 * Get style variations for frames based on frameType
 */
export function getFrameStyleByType(frameType: string): Partial<FrameElement['style']> {
  switch (frameType) {
    case FRAME_TYPES.BASIC:
      return {
        fill: 'rgba(255, 255, 255, 0.8)',
        stroke: '#3b82f6',
        strokeWidth: 2,
      };
    case FRAME_TYPES.WORKFLOW:
      return {
        fill: 'rgba(243, 244, 246, 0.7)',
        stroke: '#6366f1',
        strokeWidth: 2,
        strokeDasharray: [10, 5],
      };
    case FRAME_TYPES.DESIGN:
      return {
        fill: 'rgba(255, 255, 255, 1)',
        stroke: '#0f172a',
        strokeWidth: 1,
        shadow: {
          color: 'rgba(0, 0, 0, 0.1)',
          blur: 10,
          offsetX: 0,
          offsetY: 4,
          opacity: 0.3,
        },
      };
    case FRAME_TYPES.ORGANIZATION:
      return {
        fill: 'rgba(249, 250, 251, 0.6)',
        stroke: '#64748b',
        strokeWidth: 2,
        strokeDasharray: [5, 5],
        cornerRadius: 8,
      };
    case FRAME_TYPES.PRESENTATION:
      return {
        fill: 'rgba(255, 255, 255, 1)',
        stroke: '#475569',
        strokeWidth: 1,
        cornerRadius: 0,
        shadow: {
          color: 'rgba(0, 0, 0, 0.2)',
          blur: 15,
          offsetX: 0,
          offsetY: 5,
          opacity: 0.5,
        },
      };
    case FRAME_TYPES.COLLABORATION:
      return {
        fill: 'rgba(243, 244, 254, 0.7)',
        stroke: '#818cf8',
        strokeWidth: 2,
        strokeDasharray: [2, 2],
        cornerRadius: 4,
      };
    default:
      return {
        fill: 'rgba(255, 255, 255, 0.8)',
        stroke: '#3b82f6',
        strokeWidth: 2,
      };
  }
}

/**
 * Apply auto-layout to the elements inside a frame
 * This is a stub - actual implementation would require access to all elements
 */
export function applyAutoLayout(
  frame: FrameElement,
  childElements: unknown[]
): { frame: FrameElement; updatedElements: unknown[] } {
  // This is just a placeholder function that would need to be implemented
  // based on how your elements are structured
  return { frame, updatedElements: childElements };
}
