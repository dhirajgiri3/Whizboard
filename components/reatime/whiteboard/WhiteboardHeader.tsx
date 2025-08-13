// src/components/whiteboard/WhiteboardHeader.tsx

import React from "react";
import { motion } from "framer-motion";
import { ZoomIn, ZoomOut, Wifi, Grid3X3, Settings } from "lucide-react";
import { Cursor } from "./types";
import UserLink from "@/components/ui/UserLink";

interface WhiteboardHeaderProps {
  zoomLevel: number;
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
  collaborators: Cursor[];
  isMobile?: boolean;
  isTablet?: boolean;
}

const WhiteboardHeader: React.FC<WhiteboardHeaderProps> = ({
  zoomLevel,
  setZoomLevel,
  collaborators,
  isMobile = false,
  isTablet = false,
}) => {
  return (
    <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100/50 bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm flex-shrink-0">
      <div className="flex items-center space-x-2 sm:space-x-4">
        <div className="flex space-x-1 sm:space-x-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-400 hover:bg-red-500 transition-colors cursor-pointer shadow-sm"></div>
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-400 hover:bg-yellow-500 transition-colors cursor-pointer shadow-sm"></div>
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-400 hover:bg-green-500 transition-colors cursor-pointer shadow-sm"></div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Simplified Header Logo/Title */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-md opacity-90"></div>
            </div>
            <div>
              <div className="font-bold text-gray-800 text-sm sm:text-base">WhizBoard</div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Minimal Zoom Controls */}
          <div className="flex items-center space-x-1 sm:space-x-2 bg-white/70 backdrop-blur-md rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 border border-gray-100 shadow-sm">
            <button
              onClick={() => setZoomLevel((prev) => Math.max(25, prev - 25))}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200"
              title="Zoom out"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="text-xs font-semibold text-gray-700 min-w-[30px] sm:min-w-[35px] text-center">
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
          <div className="flex items-center space-x-1 sm:space-x-2 bg-white/70 backdrop-blur-md text-green-700 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 border border-green-100 shadow-sm">
            <div className="flex -space-x-1">
              {collaborators
                .filter((c) => c.isActive)
                .slice(0, isMobile ? 2 : 3)
                .map((user) => (
                  <UserLink
                    key={user.id}
                    user={{
                      id: user.id,
                      name: user.name,
                      email: user.email || '',
                      username: user.username,
                      image: user.avatar
                    }}
                    size="sm"
                    variant="compact"
                    showAvatar={true}
                    showEmail={false}
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-white shadow-sm"
                  />
                ))}
              {collaborators.filter((c) => c.isActive).length > (isMobile ? 2 : 3) && (
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-white bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-medium">
                  +{collaborators.filter((c) => c.isActive).length - (isMobile ? 2 : 3)}
                </div>
              )}
            </div>
            <Wifi className="w-3 h-3" />
            <span className="text-xs font-semibold hidden sm:inline">
              {collaborators.filter((c) => c.isActive).length} online
            </span>
          </div>

          {/* Simplified Additional Controls */}
          <div className="flex items-center space-x-1">
            <button className="p-1 sm:p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200"
              title="Grid view">
              <Grid3X3 className="w-3 h-3" />
            </button>
            <button className="p-1 sm:p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200"
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