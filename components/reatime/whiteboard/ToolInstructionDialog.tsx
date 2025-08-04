// src/components/whiteboard/ToolInstructionDialog.tsx

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ToolInstructionDialogProps {
  showToolInstruction: boolean;
  setShowToolInstruction: (show: boolean) => void;
  toolInstructionContent: {
    name: string;
    description: string;
    shortcut: string;
    icon: React.ComponentType<any>;
  };
  isMobile?: boolean;
  isTablet?: boolean;
}

const ToolInstructionDialog: React.FC<ToolInstructionDialogProps> = ({
  showToolInstruction,
  setShowToolInstruction,
  toolInstructionContent,
  isMobile = false,
  isTablet = false,
}) => {
  return (
    <AnimatePresence>
      {showToolInstruction && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="absolute top-4 left-4 w-72 h-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-[1000] flex flex-col overflow-hidden"
        >
          {/* Close button at top-right */}
          <button
            onClick={() => setShowToolInstruction(false)}
            className="absolute top-3 right-3 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-200 z-10"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header - Fixed */}
          <div className="p-4 pb-2 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <toolInstructionContent.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 leading-tight">
                  {toolInstructionContent.name} Tool
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  How to use this tool
                </p>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 dialog-scrollbar" style={{ height: 'calc(100% - 80px)' }}>
            <div className="space-y-3 pr-2">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-xs text-gray-700 leading-relaxed">
                  {toolInstructionContent.description}
                </p>
              </div>

              {toolInstructionContent.shortcut && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Keyboard Shortcut:
                  </span>
                  <span className="font-mono bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs font-semibold shadow-sm border border-gray-200">
                    {toolInstructionContent.shortcut.toUpperCase()}
                  </span>
                </div>
              )}

              {/* Additional tips section (generic for all tools) */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <h4 className="text-xs font-semibold text-blue-800 mb-2 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Pro Tips
                </h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Use keyboard shortcuts for faster workflow</li>
                  <li>• Use the mouse wheel to zoom in/out on the canvas</li>
                  <li>• Most elements can be moved by clicking and dragging</li>
                  <li>• Undo/Redo actions are currently being implemented</li>
                  <li>• Save your work frequently to avoid data loss</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ToolInstructionDialog;