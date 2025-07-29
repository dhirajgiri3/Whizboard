// src/components/whiteboard/WhiteboardToolbar.tsx

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
import { ToolbarItem } from "./types.ts";

interface WhiteboardToolbarProps {
  toolbarItems: ToolbarItem[];
  activeTool: number;
  selectedColor: string;
  selectedElement: string | null;
  handleToolSelect: (index: number) => void;
  handleDeleteElement: () => void;
}

const WhiteboardToolbar: React.FC<WhiteboardToolbarProps> = ({
  toolbarItems,
  activeTool,
  selectedColor,
  selectedElement,
  handleToolSelect,
  handleDeleteElement,
}) => {
  return (
    <div className="px-6 py-4 border-t border-gray-100/50 bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Main Tool Buttons */}
          <div className="flex items-center space-x-1 bg-white/70 backdrop-blur-md rounded-xl px-2 py-1.5 border border-gray-100 shadow-sm">
            {toolbarItems.map((tool, i) => (
              <button
                key={i}
                onClick={() => tool.isFunctional ? handleToolSelect(i) : null}
                disabled={!tool.isFunctional}
                className={`
                  relative w-9 h-9 rounded-lg transition-all duration-200 flex items-center justify-center group overflow-hidden
                  ${tool.active
                    ? `bg-gradient-to-br ${tool.gradient.join(' ')} text-white shadow-md shadow-${tool.theme}-500/30`
                    : tool.isFunctional
                      ? "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                      : "text-gray-300 cursor-not-allowed opacity-50"
                  }
                `}
                title={tool.isFunctional ? `${tool.name} (${tool.shortcut})` : `${tool.name} - Not implemented`}
              >
                <tool.icon className={`w-4 h-4 transition-transform duration-100 ${tool.active ? 'scale-110' : ''}`} />
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gradient-to-b from-transparent via-gray-200 to-transparent" />

          {/* Simplified Action Buttons */}
          <div className="flex items-center space-x-1 bg-white/70 backdrop-blur-md rounded-xl px-2 py-1.5 border border-gray-100 shadow-sm">
            <button className="w-9 h-9 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors duration-200"
              title="Undo"
              disabled={true}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors duration-200"
              title="Duplicate"
              disabled={true}
            >
              <Copy className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-100 flex items-center justify-center transition-colors duration-200"
              title="Delete"
              onClick={handleDeleteElement}
              disabled={!selectedElement}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Minimal Color Palette Preview (now showing selected color) */}
          <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-md rounded-xl px-3 py-1.5 border border-gray-100 shadow-sm">
            <Palette className="w-3 h-3 text-gray-500" />
            <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: selectedColor }}
              title="Current selected color"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-3">
          {/* Simplified Status Indicator */}
          <div className="flex items-center space-x-1 text-xs text-gray-600 bg-white/70 backdrop-blur-md rounded-lg px-2 py-1.5 border border-gray-100 shadow-sm">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <Save className="w-3 h-3 text-green-500" />
            <span className="font-medium">Saved</span>
          </div>

          {/* Minimal Export/Import Actions */}
          <div className="flex items-center space-x-1">
            <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200"
              title="Export"
              disabled={true}
            >
              <Download className="w-3 h-3" />
            </button>
            <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200"
              title="Import"
              disabled={true}
            >
              <Upload className="w-3 h-3" />
            </button>
          </div>

          {/* Enhanced Share Button */}
          <button className="flex items-center space-x-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md shadow-blue-500/30 hover:shadow-lg"
            disabled={true}
          >
            <Share2 className="w-3 h-3" />
            <span className="font-semibold text-sm">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhiteboardToolbar;