// src/components/whiteboard/WhiteboardHeader.tsx

import React from "react";
import { motion } from "framer-motion";
import { ZoomIn, ZoomOut, Wifi, Grid3X3, Settings } from "lucide-react";
import { Cursor } from "./types";

interface WhiteboardHeaderProps {
  zoomLevel: number;
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
  collaborators: Cursor[];
}

const WhiteboardHeader: React.FC<WhiteboardHeaderProps> = ({
  zoomLevel,
  setZoomLevel,
  collaborators,
}) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100/50 bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm">
      <div className="flex items-center space-x-4">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500 transition-colors cursor-pointer shadow-sm"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400 hover:bg-yellow-500 transition-colors cursor-pointer shadow-sm"></div>
          <div className="w-3 h-3 rounded-full bg-green-400 hover:bg-green-500 transition-colors cursor-pointer shadow-sm"></div>
        </div>
        <div className="flex items-center space-x-4">
          {/* Simplified Header Logo/Title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <div className="w-4 h-4 bg-white rounded-md opacity-90"></div>
            </div>
            <div>
              <div className="font-bold text-gray-800 text-base">CyperBoard</div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Minimal Zoom Controls */}
          <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-md rounded-lg px-3 py-1.5 border border-gray-100 shadow-sm">
            <button
              onClick={() => setZoomLevel((prev) => Math.max(25, prev - 25))}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200"
              title="Zoom out"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="text-xs font-semibold text-gray-700 min-w-[35px] text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel((prev) => Math.min(200, prev + 25))}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200"
              title="Zoom in"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>

          {/* Clean Collaborators Display */}
          <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-md text-green-700 rounded-lg px-3 py-1.5 border border-green-100 shadow-sm">
            <div className="flex -space-x-1">
              {collaborators
                .filter((c) => c.isActive)
                .slice(0, 3)
                .map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="w-6 h-6 rounded-full border border-white shadow-sm"
                    style={{
                      backgroundImage: `url(${user.avatar})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                    title={user.name}
                  />
                ))}
              {collaborators.filter((c) => c.isActive).length > 3 && (
                <div className="w-6 h-6 rounded-full border border-white bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-medium">
                  +{collaborators.filter((c) => c.isActive).length - 3}
                </div>
              )}
            </div>
            <Wifi className="w-3 h-3" />
            <span className="text-xs font-semibold">
              {collaborators.filter((c) => c.isActive).length} online
            </span>
          </div>

          {/* Simplified Additional Controls */}
          <div className="flex items-center space-x-1">
            <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200"
              title="Grid view">
              <Grid3X3 className="w-3 h-3" />
            </button>
            <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200"
              title="Settings">
              <Settings className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhiteboardHeader;