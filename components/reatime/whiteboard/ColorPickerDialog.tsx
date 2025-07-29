// src/components/whiteboard/ColorPickerDialog.tsx

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette } from "lucide-react";
import { ColorPalette } from "./types";

interface ColorPickerDialogProps {
  showColorPicker: boolean;
  setShowColorPicker: (show: boolean) => void;
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  colorPalettes: ColorPalette[];
}

const ColorPickerDialog: React.FC<ColorPickerDialogProps> = ({
  showColorPicker,
  setShowColorPicker,
  selectedColor,
  setSelectedColor,
  colorPalettes,
}) => {
  return (
    <AnimatePresence>
      {showColorPicker && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="absolute top-4 right-4 w-80 h-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-[1000] flex flex-col overflow-hidden"
        >
          {/* Close button at top-right */}
          <button
            onClick={() => setShowColorPicker(false)}
            className="absolute top-3 right-3 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-200 z-10"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header - Fixed */}
          <div className="p-4 pb-2 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg">
                <Palette className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 leading-tight">
                  Color Picker
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  Choose your active color
                </p>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 dialog-scrollbar" style={{ height: 'calc(100% - 80px)' }}>
            <div className="space-y-4 pr-2">
              {/* Current Color Display */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700">Current Color:</span>
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-6 h-6 rounded-md border-2 border-gray-300 shadow-sm transition-all duration-200"
                      style={{ backgroundColor: selectedColor }}
                    />
                    <span className="font-mono text-xs text-gray-600 font-semibold">{selectedColor}</span>
                  </div>
                </div>
              </div>

              {/* Color Palettes */}
              <div className="space-y-3">
                {colorPalettes.map((palette, paletteIndex) => (
                  <div key={paletteIndex} className="space-y-2">
                    <h4 className="text-xs font-semibold text-gray-800 flex items-center">
                      <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: palette.colors[0] }} />
                      {palette.name} Palette
                    </h4>
                    <div className="grid grid-cols-6 gap-1.5">
                      {palette.colors.map((color, colorIndex) => (
                        <button
                          key={colorIndex}
                          onClick={() => setSelectedColor(color)}
                          className={`
                            w-8 h-8 rounded-lg border-2 transition-all duration-200 transform hover:scale-110 active:scale-95
                            ${selectedColor === color
                              ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg scale-105'
                              : 'border-gray-200 hover:border-gray-300'
                            }
                          `}
                          style={{ backgroundColor: color }}
                          title={`${palette.name} - Color ${colorIndex + 1} (${color})`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Custom Color Section */}
              <div className="space-y-2 pt-3 border-t border-gray-100">
                <h4 className="text-xs font-semibold text-gray-800">More Colors</h4>
                <div className="grid grid-cols-8 gap-1">
                  {[
                    "#E0E7FF", "#C7D2FE", "#A5B4FC", "#818CF8", "#6366F1",
                    "#FEE2E2", "#FECACA", "#FCA5A5", "#F87171", "#EF4444",
                    "#D1FAE5", "#A7F3D0", "#6EE7B7", "#34D399", "#10B981",
                    "#FFEDD5", "#FED7AA", "#FDBA74", "#FB923C", "#F97316",
                    "#F3E8FF", "#E9D5FF", "#D8B4FE", "#C4B5FD", "#A78BFA",
                    "#F0F9FF", "#E0F2FE", "#BAE6FD", "#7DD3FC", "#38BDF8",
                    "#FFFBEB", "#FDE68A", "#FCD34D", "#FBBF24", "#F59E0B",
                    "#ECFDF5", "#D1FAE5", "#A7F3D0", "#6EE7B7", "#34D399",
                    "#FEF2F2", "#FEE2E2", "#FECACA", "#FCA5A5", "#F87171",
                  ].map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(color)}
                      className={`
                        w-7 h-7 rounded-md border-2 transition-all duration-200 transform hover:scale-110 active:scale-95
                        ${selectedColor === color
                          ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg scale-105'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                      style={{ backgroundColor: color }}
                      title={`Custom Color ${index + 1} (${color})`}
                    />
                  ))}
                </div>
              </div>

              {/* Tips Section */}
              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100">
                <h4 className="text-xs font-semibold text-yellow-800 mb-2 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Color Tips
                </h4>
                <ul className="text-xs text-yellow-700 space-y-1">
                  <li>• Selected color will be used for all new drawings and shapes</li>
                  <li>• You can also change colors from the toolbar palette</li>
                  <li>• Different colors help organize your whiteboard content</li>
                  <li>• Use contrasting colors for better visibility</li>
                  <li>• Use the custom colors for more diverse options</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ColorPickerDialog;