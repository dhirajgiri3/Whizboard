"use client";

import React from "react";
import {
  RotateCcw,
  Copy,
  Trash2,
  Share2,
  Save,
  Download,
  Upload,
  Palette,
} from "lucide-react";
import { ToolbarItem } from "./types";

interface WhiteboardToolbarProps {
  toolbarItems: ToolbarItem[];
  activeTool: number;
  selectedColor: string;
  selectedElement: string | null;
  handleToolSelect: (index: number) => void;
  handleDeleteElement: () => void;
  isMobile?: boolean;
  isTablet?: boolean;
}

const WhiteboardToolbar: React.FC<WhiteboardToolbarProps> = ({
  toolbarItems,
  activeTool,
  selectedColor,
  selectedElement,
  handleToolSelect,
  handleDeleteElement,
  isMobile = false,
  isTablet = false,
}) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-50 bg-[#0F0F10]/95 backdrop-blur-xl border-t border-white/[0.08] rounded-b-xl">
      <div className="flex items-center justify-center gap-2 px-4 py-3">
        {/* Main Tool Buttons */}
        <div className="flex items-center gap-1">
          {toolbarItems.map((tool, i) => (
            <button
              key={i}
              onClick={() => tool.isFunctional ? handleToolSelect(i) : null}
              disabled={!tool.isFunctional}
              className={`
                relative w-10 h-10 rounded-lg transition-all duration-200 flex items-center justify-center group
                ${activeTool === i
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-105"
                  : tool.isFunctional
                    ? "text-white/60 hover:text-white hover:bg-white/[0.06] hover:scale-105"
                    : "text-white/25 cursor-not-allowed"
                }
              `}
              title={tool.isFunctional ? `${tool.name} (${tool.shortcut})` : `${tool.name} - Coming soon`}
            >
              <tool.icon className={`w-5 h-5 transition-all duration-200 ${activeTool === i ? 'scale-110' : 'group-hover:scale-110'}`} />
              {!tool.isFunctional && (
                <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-amber-400 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-white/[0.06]" />

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <button 
            className="w-10 h-10 rounded-lg text-white/50 hover:text-white/70 hover:bg-white/[0.06] hover:scale-105 flex items-center justify-center transition-all duration-200 disabled:opacity-25"
            title="Undo"
            disabled={true}
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button 
            className="w-10 h-10 rounded-lg text-white/50 hover:text-white/70 hover:bg-white/[0.06] hover:scale-105 flex items-center justify-center transition-all duration-200 disabled:opacity-25"
            title="Duplicate"
            disabled={true}
          >
            <Copy className="w-5 h-5" />
          </button>
          <button 
            className="w-10 h-10 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:scale-105 flex items-center justify-center transition-all duration-200 disabled:opacity-25"
             title="Delete"
             onClick={handleDeleteElement}
             disabled={!selectedElement}
           >
             <Trash2 className="w-5 h-5" />
           </button>
         </div>

         {/* Divider */}
         <div className="w-px h-8 bg-white/[0.06]" />

         {/* Color Indicator */}
         <div className="flex items-center gap-2">
           <Palette className="w-4 h-4 text-white/40" />
           <div 
             className="w-6 h-6 rounded-md border border-white/15 shadow-sm"
             style={{ backgroundColor: selectedColor }}
             title="Current color"
           />
         </div>

         {/* Divider */}
         <div className="w-px h-8 bg-white/[0.06]" />

         {/* Status & Share */}
         <div className="flex items-center gap-3">
           {/* Status Indicator */}
           <div className="flex items-center gap-2 text-xs text-white/50">
             <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
             <Save className="w-4 h-4 text-emerald-400" />
             <span className="hidden sm:inline font-medium text-xs">Saved</span>
           </div>

           {/* Share Button */}
           <button 
             className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-all duration-200 shadow-lg shadow-blue-600/20 disabled:opacity-40 hover:scale-105"
             disabled={true}
             title="Share whiteboard"
           >
             <Share2 className="w-4 h-4" />
             <span className="hidden sm:inline font-medium text-xs">Share</span>
           </button>
         </div>
       </div>
     </div>
  );
};

export default WhiteboardToolbar;