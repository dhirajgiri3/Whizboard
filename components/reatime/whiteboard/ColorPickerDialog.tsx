// src/components/whiteboard/ColorPickerDialog.tsx

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, X, Check } from "lucide-react";
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
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 30,
            duration: 0.3
          }}
          className="absolute top-4 right-4 w-88 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100/50 z-[1000] flex flex-col overflow-hidden backdrop-blur-sm"
          style={{
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)"
          }}
        >
          {/* Enhanced Close Button */}
          <button
            onClick={() => setShowColorPicker(false)}
            className="absolute top-4 right-4 w-8 h-8 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-all duration-200 z-10 group"
          >
            <X className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors" />
          </button>

          {/* Enhanced Header */}
          <div className="p-6 pb-4 flex-shrink-0 border-b border-gray-50 bg-gradient-to-r from-gray-50/50 to-white">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 leading-tight">
                  Color Palette
                </h3>
                <p className="text-sm text-gray-500 font-medium">
                  Choose your active drawing color
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Current Color Display */}
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-25 border-b border-gray-50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-semibold text-gray-700">Current Color:</span>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-8 h-8 rounded-xl border-2 border-gray-200 shadow-sm transition-all duration-200 relative overflow-hidden"
                    style={{ backgroundColor: selectedColor }}
                  >
                    {selectedColor === "#FFFFFF" && (
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 opacity-50" />
                    )}
                  </div>
                  <span className="font-mono text-sm text-gray-600 font-semibold bg-gray-50 px-2 py-1 rounded-lg">
                    {selectedColor}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-600 font-medium">Active</span>
              </div>
            </div>
          </div>

          {/* Scrollable Content Container */}
          <div className="flex-1 overflow-y-auto" style={{ height: 'calc(100% - 180px)' }}>
            <div className="px-6 py-4 space-y-6">
              {/* Enhanced Color Palettes */}
              <div className="space-y-4">
                {colorPalettes.map((palette, paletteIndex) => (
                  <div key={paletteIndex} className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.colors[0] }} />
                      <h4 className="text-sm font-semibold text-gray-800">
                        {palette.name} Palette
                      </h4>
                      <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
                    </div>
                    <div className="grid grid-cols-8 gap-2">
                      {palette.colors.map((color, colorIndex) => (
                        <motion.button
                          key={colorIndex}
                          onClick={() => setSelectedColor(color)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className={`
                            relative w-10 h-10 rounded-xl border-2 transition-all duration-200 group
                            ${selectedColor === color
                              ? 'border-blue-500 ring-2 ring-blue-100 shadow-lg scale-105'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                            }
                          `}
                          style={{ backgroundColor: color }}
                          title={`${palette.name} - Color ${colorIndex + 1} (${color})`}
                        >
                          {selectedColor === color && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute inset-0 flex items-center justify-center"
                            >
                              <Check className="w-4 h-4 text-white drop-shadow-sm" />
                            </motion.div>
                          )}
                          {color === "#FFFFFF" && (
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 opacity-50 rounded-xl" />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Enhanced Custom Color Section */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-semibold text-gray-800">Extended Colors</h4>
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
                </div>
                <div className="grid grid-cols-10 gap-1.5">
                  {[
                    "#E0E7FF", "#C7D2FE", "#A5B4FC", "#818CF8", "#6366F1", "#4F46E5", "#4338CA", "#3730A3",
                    "#FEE2E2", "#FECACA", "#FCA5A5", "#F87171", "#EF4444", "#DC2626", "#B91C1C", "#991B1B",
                    "#D1FAE5", "#A7F3D0", "#6EE7B7", "#34D399", "#10B981", "#059669", "#047857", "#065F46",
                    "#FFEDD5", "#FED7AA", "#FDBA74", "#FB923C", "#F97316", "#EA580C", "#C2410C", "#9A3412",
                    "#F3E8FF", "#E9D5FF", "#D8B4FE", "#C4B5FD", "#A78BFA", "#8B5CF6", "#7C3AED", "#6D28D9",
                    "#F0F9FF", "#E0F2FE", "#BAE6FD", "#7DD3FC", "#38BDF8", "#0EA5E9", "#0284C7", "#0369A1",
                    "#FFFBEB", "#FDE68A", "#FCD34D", "#FBBF24", "#F59E0B", "#D97706", "#B45309", "#92400E",
                    "#ECFDF5", "#D1FAE5", "#A7F3D0", "#6EE7B7", "#34D399", "#10B981", "#059669", "#047857",
                    "#FEF2F2", "#FEE2E2", "#FECACA", "#FCA5A5", "#F87171", "#EF4444", "#DC2626", "#B91C1C",
                  ].map((color, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setSelectedColor(color)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={`
                        relative w-8 h-8 rounded-lg border-2 transition-all duration-200 group
                        ${selectedColor === color
                          ? 'border-blue-500 ring-2 ring-blue-100 shadow-lg scale-105'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                        }
                      `}
                      style={{ backgroundColor: color }}
                      title={`Extended Color ${index + 1} (${color})`}
                    >
                      {selectedColor === color && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <Check className="w-3 h-3 text-white drop-shadow-sm" />
                        </motion.div>
                      )}
                      {color === "#FFFFFF" && (
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 opacity-50 rounded-lg" />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Enhanced Tips Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Palette className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">
                      Pro Tips
                    </h4>
                    <ul className="text-xs text-blue-800 space-y-1.5">
                      <li className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                        <span>Selected color applies to all new drawings and shapes</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                        <span>Use contrasting colors for better visibility and organization</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                        <span>Access quick colors from the toolbar palette anytime</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                        <span>Different colors help organize your whiteboard content</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ColorPickerDialog;