// src/components/whiteboard/WhiteboardCanvas.tsx

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CanvasElement, DrawingPath, Cursor } from "./types";

interface WhiteboardCanvasProps {
  canvasRef: React.RefObject<SVGSVGElement | null>;
  canvasWidth: number;
  canvasHeight: number;
  zoomLevel: number;
  panOffset: { x: number; y: number };
  activeTool: number;
  drawingPaths: DrawingPath[];
  currentPath: string;
  canvasElements: CanvasElement[];
  selectedColor: string;
  selectedElement: string | null;
  editingTextElementId: string | null;
  editingTextContent: string;
  collaborators: Cursor[];
  hoveredElementId: string | null;
  handleCanvasMouseDown: (e: React.MouseEvent | TouchEvent) => void;
  handleCanvasMouseMove: (e: React.MouseEvent | TouchEvent) => void;
  handleCanvasMouseUp: () => void;
  setEditingTextContent: React.Dispatch<React.SetStateAction<string>>;
  setEditingTextElementId: React.Dispatch<React.SetStateAction<string | null>>;
  setCanvasElements: React.Dispatch<React.SetStateAction<CanvasElement[]>>;
  handleElementSelect: (elementId: string) => void;
  setHoveredElementId: React.Dispatch<React.SetStateAction<string | null>>;
  setSelectedElement: React.Dispatch<React.SetStateAction<string | null>>;
  isPanning: boolean;
  isDragging?: boolean;
}

const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({
  canvasRef,
  canvasWidth,
  canvasHeight,
  zoomLevel,
  panOffset,
  activeTool,
  drawingPaths,
  currentPath,
  canvasElements,
  selectedColor,
  selectedElement,
  editingTextElementId,
  editingTextContent,
  collaborators,
  hoveredElementId,
  handleCanvasMouseDown,
  handleCanvasMouseMove,
  handleCanvasMouseUp,
  setEditingTextContent,
  setEditingTextElementId,
  setCanvasElements,
  handleElementSelect,
  setHoveredElementId,
  setSelectedElement,
  isPanning,
  isDragging = false,
}) => {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden focus:outline-none" style={{ outline: 'none', border: 'none' }}>
      {/* Modern Grid with Depth */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: "30px 30px, 30px 30px",
            opacity: 0.8,
            backgroundColor: '#fcfcfc',
          }}
        />
      </div>

      {/* SVG Canvas */}
      <svg
        ref={canvasRef}
        className="absolute inset-0 w-full h-full select-none focus:outline-none"
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        preserveAspectRatio="xMidYMid meet"
        style={{
          cursor: activeTool === 0
            ? "crosshair"
            : activeTool === 7
              ? (isPanning ? "grabbing" : "grab")
              : isDragging
                ? "grabbing"
                : hoveredElementId
                  ? "grab"
                  : "default",
          transform: `scale(${zoomLevel / 100}) translate(${panOffset.x}px, ${panOffset.y}px)`,
          touchAction: 'none', // Prevent default touch behaviors
          outline: 'none',
          border: 'none',
        }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        onTouchStart={(e) => {
          e.preventDefault();
          handleCanvasMouseDown(e as any);
        }}
        onTouchMove={(e) => {
          // Handle touch move events
          e.preventDefault(); // Prevent default touch behavior
          handleCanvasMouseMove(e as any);
        }}
        onTouchEnd={(e) => {
          e.preventDefault(); // Prevent default touch behavior
          handleCanvasMouseUp();
        }}
        role="img"
        aria-label="Interactive whiteboard canvas"
        tabIndex={0}
        onKeyDown={(e) => {
          // Keyboard accessibility for canvas
          if (e.key === 'Escape') {
            setSelectedElement(null);
            setEditingTextElementId(null);
          }
        }}
        onWheel={(e) => {
          // Handle zoom with mouse wheel
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -10 : 10;
            // You can add zoom functionality here if needed
          }
        }}
      >
        {/* Enhanced Drawing Paths */}
        {drawingPaths.map((path) => (
          <g key={path.id}>
            {/* Path shadow for depth */}
            <path
              d={path.path}
              stroke={path.color}
              strokeWidth={path.strokeWidth + 1}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.1"
              transform="translate(1, 1)"
            />
            {/* Main path */}
            <path
              id={path.id} // Add ID for hit testing with eraser
              d={path.path}
              stroke={path.color}
              strokeWidth={path.strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={path.opacity || 0.9}
              filter="none"
              className="transition-all duration-300 hover:opacity-100"
            />
          </g>
        ))}

        {/* Enhanced Current Drawing Path */}
        {currentPath && (
          <g>
            <path
              d={currentPath}
              stroke={selectedColor}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
              filter="none"
              className="animate-pulse"
            />
          </g>
        )}

        {/* SVG Filters for Enhanced Effects */}
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="activeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="elementShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* Enhanced Canvas Elements */}
        {canvasElements.map((element) => {
          const isSelected = selectedElement === element.id;

          const renderX = element.x;
          const renderY = element.y;

          if (element.type === "circle") {
            return (
              <g
                key={element.id}
                onClick={() => handleElementSelect(element.id)}
                onMouseEnter={() => setHoveredElementId(element.id)}
                onMouseLeave={() => setHoveredElementId(null)}
              >
                {/* Circle shadow */}
                <circle
                  cx={renderX + 2}
                  cy={renderY + 2}
                  r={element.radius}
                  fill={element.color}
                  opacity="0.1"
                />
                {/* Main circle */}
                <circle
                  id={element.id} // Add ID for hit testing
                  cx={renderX}
                  cy={renderY}
                  r={element.radius}
                  stroke={element.color}
                  strokeWidth={isSelected ? "3" : "2"}
                  fill={`url(#gradient-${element.id})`}
                  className="cursor-pointer transition-all duration-300"
                  filter={isSelected ? "url(#elementShadow)" : "none"}
                  opacity={element.opacity || 0.9}
                  style={{
                    strokeDasharray: isSelected ? "6,3" : (hoveredElementId === element.id && !isSelected ? "4,2" : "none"),
                    strokeWidth: isSelected ? "3" : (hoveredElementId === element.id ? "2.5" : "2"),
                    animationDuration: isSelected ? "2s" : "none",
                    animationIterationCount: isSelected ? "infinite" : "none",
                  }}
                />
                {/* Gradient definition */}
                <defs>
                  <radialGradient id={`gradient-${element.id}`} cx="30%" cy="30%">
                    <stop offset="0%" stopColor={`${element.color}40`} />
                    <stop offset="70%" stopColor={`${element.color}20`} />
                    <stop offset="100%" stopColor={`${element.color}10`} />
                  </radialGradient>
                </defs>
              </g>
            );
          }

          if (element.type === "rectangle") {
            return (
              <g
                key={element.id}
                onClick={() => handleElementSelect(element.id)}
                onMouseEnter={() => setHoveredElementId(element.id)}
                onMouseLeave={() => setHoveredElementId(null)}
              >
                {/* Rectangle shadow */}
                <rect
                  x={renderX + 2}
                  y={renderY + 2}
                  width={element.width}
                  height={element.height}
                  rx="8"
                  fill={element.color}
                  opacity="0.1"
                />
                {/* Main rectangle */}
                <rect
                  id={element.id} // Add ID for hit testing
                  x={renderX}
                  y={renderY}
                  width={element.width}
                  height={element.height}
                  rx="8"
                  stroke={element.color}
                  strokeWidth={isSelected ? "3" : "2"}
                  fill={`url(#rect-gradient-${element.id})`}
                  className="cursor-pointer transition-all duration-300"
                  filter={isSelected ? "url(#elementShadow)" : "none"}
                  opacity={element.opacity || 0.9}
                  style={{
                    strokeDasharray: isSelected ? "6,3" : (hoveredElementId === element.id && !isSelected ? "4,2" : "none"),
                    strokeWidth: isSelected ? "3" : (hoveredElementId === element.id ? "2.5" : "2"),
                  }}
                />
                {/* Rectangle gradient */}
                <defs>
                  <linearGradient id={`rect-gradient-${element.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={`${element.color}30`} />
                    <stop offset="100%" stopColor={`${element.color}10`} />
                  </linearGradient>
                </defs>
              </g>
            );
          }

          if (element.type === "note") {
            return (
              <g
                key={element.id}
                onClick={() => handleElementSelect(element.id)}
                onMouseEnter={() => setHoveredElementId(element.id)}
                onMouseLeave={() => setHoveredElementId(null)}
              >
                {/* Note shadow */}
                <rect
                  x={renderX + 3}
                  y={renderY + 3}
                  width={element.width}
                  height={element.height}
                  rx="10"
                  fill={element.color}
                  opacity="0.15"
                />
                {/* Main note */}
                <rect
                  id={element.id} // Add ID for hit testing
                  x={renderX}
                  y={renderY}
                  width={element.width}
                  height={element.height}
                  rx="10"
                  stroke={element.color}
                  strokeWidth={isSelected ? "3" : "2"}
                  fill={`url(#note-gradient-${element.id})`}
                  className="cursor-pointer transition-all duration-300"
                  filter={isSelected ? "url(#elementShadow)" : "none"}
                  opacity={element.opacity || 0.95}
                  style={{
                    strokeDasharray: isSelected ? "6,3" : (hoveredElementId === element.id && !isSelected ? "4,2" : "none"),
                    strokeWidth: isSelected ? "3" : (hoveredElementId === element.id ? "2.5" : "2"),
                  }}
                />
                {/* Note header line */}
                <line
                  x1={renderX + 10}
                  y1={renderY + 20}
                  x2={renderX + (element.width || 0) - 10}
                  y2={renderY + 20}
                  stroke={element.color}
                  strokeWidth="1"
                  opacity="0.3"
                />
                {/* Note text or editor */}
                {editingTextElementId === element.id ? (
                  <foreignObject
                    x={renderX + 10}
                    y={renderY + 30}
                    width={(element.width || 0) - 20}
                    height={(element.height || 0) - 40}
                    className="canvas-element-text-editor"
                  >
                    <textarea
                      value={editingTextContent}
                      onChange={(e) => setEditingTextContent(e.target.value)}
                      onBlur={() => {
                        setCanvasElements((prev) =>
                          prev.map((el) =>
                            el.id === element.id ? { ...el, content: editingTextContent } : el
                          )
                        );
                        setEditingTextElementId(null);
                        setEditingTextContent("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          (e.target as HTMLTextAreaElement).blur();
                        }
                      }}
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        resize: 'none',
                        backgroundColor: 'transparent',
                        outline: 'none',
                        fontFamily: 'inherit',
                        fontSize: '14px',
                        fontWeight: 'semibold',
                        color: element.color,
                        opacity: '0.8',
                        padding: '0px',
                        margin: '0px',
                        overflow: 'hidden',
                      }}
                      autoFocus
                    />
                  </foreignObject>
                ) : (
                  <text
                    x={renderX + (element.width || 0) / 2}
                    y={renderY + (element.height || 0) / 2 + 8}
                    textAnchor="middle"
                    className="text-sm font-semibold pointer-events-none select-none"
                    fill={element.color}
                    opacity="0.8"
                  >
                    {element.content}
                  </text>
                )}
                {/* Note gradient */}
                <defs>
                  <linearGradient id={`note-gradient-${element.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={`${element.color}25`} />
                    <stop offset="50%" stopColor={`${element.color}15`} />
                    <stop offset="100%" stopColor={`${element.color}20`} />
                  </linearGradient>
                </defs>
              </g>
            );
          }

          if (element.type === "text") {
            return (
              <g
                key={element.id}
                onClick={() => handleElementSelect(element.id)}
                onDoubleClick={() => {
                    setSelectedElement(element.id);
                    setEditingTextElementId(element.id);
                    setEditingTextContent(element.content || "");
                }}
                onMouseEnter={() => setHoveredElementId(element.id)}
                onMouseLeave={() => setHoveredElementId(null)}
              >
                {/* Text element */}
                {editingTextElementId === element.id ? (
                  <foreignObject
                    x={renderX}
                    y={renderY - 16} // Adjusted to better align with text baseline
                    width="200"
                    height="50"
                    className="canvas-element-text-editor"
                  >
                    <textarea
                      value={editingTextContent}
                      onChange={(e) => setEditingTextContent(e.target.value)}
                      onBlur={() => {
                        setCanvasElements((prev) =>
                          prev.map((el) =>
                            el.id === element.id ? { ...el, content: editingTextContent } : el
                          )
                        );
                        setEditingTextElementId(null);
                        setEditingTextContent("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          (e.target as HTMLTextAreaElement).blur();
                        }
                      }}
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        resize: 'none',
                        backgroundColor: 'transparent',
                        outline: 'none',
                        fontFamily: 'inherit',
                        fontSize: '16px',
                        fontWeight: 'semibold',
                        color: element.color,
                        opacity: '0.9',
                        padding: '0px',
                        margin: '0px',
                        overflow: 'hidden',
                      }}
                      autoFocus
                    />
                  </foreignObject>
                ) : (
                  <text
                    id={element.id} // Add ID for hit testing
                    x={renderX}
                    y={renderY + 16}
                    className="cursor-pointer transition-all duration-300"
                    style={{
                      fontSize: '16px',
                      fontWeight: 'semibold',
                      fill: element.color,
                      opacity: element.opacity || 0.9,
                      strokeDasharray: isSelected ? "6,3" : (hoveredElementId === element.id && !isSelected ? "4,2" : "none"),
                      strokeWidth: isSelected ? "1" : (hoveredElementId === element.id ? "0.5" : "0"),
                    }}
                  >
                    {element.content}
                  </text>
                )}
              </g>
            );
          }

          return null;
        })}
      </svg>

      {/* Collaborative cursors */}
      <AnimatePresence>
        {collaborators.map(
          (cursor) =>
            cursor.isActive && (
              <motion.div
                key={cursor.id}
                className="absolute pointer-events-none z-10"
                initial={{ opacity: 0 }}
                animate={{
                  x: cursor.x,
                  y: cursor.y,
                  opacity: 1,
                }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  className="relative"
                >
                  {/* Simple cursor indicator */}
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
                    style={{ backgroundColor: cursor.color }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                  
                  {/* User name label */}
                  <div className="absolute top-5 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded-lg shadow-lg border border-white/20 min-w-max">
                    {cursor.name}
                  </div>
                </motion.div>
              </motion.div>
            )
        )}
      </AnimatePresence>
    </div>
  );
};

export default WhiteboardCanvas;