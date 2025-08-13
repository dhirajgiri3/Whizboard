"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RotateCcw, 
  RotateCw, 
  Eye, 
  EyeOff, 
  Trash2, 
  Copy, 
  Download,
  Image as ImageIcon
} from 'lucide-react';
import { ImageElement } from '@/types';

interface FloatingImageToolbarProps {
  imageElement: ImageElement;
  isVisible: boolean;
  position: { x: number; y: number };
  onUpdate: (updates: Partial<ImageElement>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onDownload: () => void;
}

const FloatingImageToolbar: React.FC<FloatingImageToolbarProps> = ({
  imageElement,
  isVisible,
  position,
  onUpdate,
  onDelete,
  onDuplicate,
  onDownload,
}) => {
  const [opacity, setOpacity] = useState(imageElement.opacity || 1);

  const handleOpacityChange = (newOpacity: number) => {
    setOpacity(newOpacity);
    onUpdate({ opacity: newOpacity });
  };

  const handleRotate = (direction: 'left' | 'right') => {
    const currentRotation = imageElement.rotation || 0;
    const newRotation = direction === 'left' 
      ? currentRotation - 90 
      : currentRotation + 90;
    onUpdate({ rotation: newRotation });
  };

  const handleFlip = (direction: 'horizontal' | 'vertical') => {
    const currentScaleX = imageElement.scaleX || 1;
    const currentScaleY = imageElement.scaleY || 1;
    
    if (direction === 'horizontal') {
      onUpdate({ scaleX: -currentScaleX });
    } else {
      onUpdate({ scaleY: -currentScaleY });
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 10 }}
        transition={{ duration: 0.2 }}
        className="absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-3"
        style={{
          left: position.x,
          top: position.y - 80,
        }}
      >
        <div className="flex flex-col gap-3">
          {/* Main controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleRotate('left')}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              title="Rotate Left"
            >
              <RotateCcw className="w-4 h-4 text-gray-600" />
            </button>
            
            <button
              onClick={() => handleRotate('right')}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              title="Rotate Right"
            >
              <RotateCw className="w-4 h-4 text-gray-600" />
            </button>
            
            <button
              onClick={() => handleFlip('horizontal')}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              title="Flip Horizontal"
            >
              <ImageIcon className="w-4 h-4 text-gray-600" />
            </button>
            
            <button
              onClick={onDuplicate}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              title="Duplicate"
            >
              <Copy className="w-4 h-4 text-gray-600" />
            </button>
            
            <button
              onClick={onDownload}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4 text-gray-600" />
            </button>
            
            <button
              onClick={onDelete}
              className="p-2 hover:bg-red-50 rounded-md transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>

          {/* Opacity slider */}
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-gray-600" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={opacity}
              onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-xs text-gray-500 w-8">
              {Math.round(opacity * 100)}%
            </span>
          </div>

          {/* Image info */}
          <div className="text-xs text-gray-500 border-t pt-2">
            <div className="flex justify-between">
              <span>Size:</span>
              <span>{Math.round(imageElement.width)} × {Math.round(imageElement.height)}</span>
            </div>
            {imageElement.naturalWidth && imageElement.naturalHeight && (
              <div className="flex justify-between">
                <span>Original:</span>
                <span>{imageElement.naturalWidth} × {imageElement.naturalHeight}</span>
              </div>
            )}
          </div>
        </div>

        <style jsx>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
          }
          
          .slider::-moz-range-thumb {
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            border: none;
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
};

export default FloatingImageToolbar;
