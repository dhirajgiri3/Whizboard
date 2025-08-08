import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Download, 
  Image, 
  FileText, 
  Code, 
  Settings, 
  Check, 
  FileDown,
  Palette,
  Crop,
  Zap,
  Info,
  Upload
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardName: string;
}

interface ExportOptions {
  format: 'png' | 'svg' | 'json';
  resolution: '1x' | '2x' | '4x';
  background: 'transparent' | 'white' | 'black' | 'custom';
  customBackground?: string;
  area: 'all' | 'selection' | 'custom';
  customBounds?: { x: number; y: number; width: number; height: number };
  includeMetadata: boolean;
  compression: boolean;
}

export default function ExportModal({ isOpen, onClose, boardName }: ExportModalProps) {
  const params = useParams();
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'png',
    resolution: '1x',
    background: 'transparent',
    area: 'all',
    includeMetadata: true,
    compression: true,
  });

  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);
    try {
      const url = new URL(`/api/board/${params.id}/export`, window.location.origin);
      
      // Add query parameters
      url.searchParams.set('format', exportOptions.format);
      url.searchParams.set('resolution', exportOptions.resolution);
      url.searchParams.set('background', exportOptions.background);
      if (exportOptions.customBackground) {
        url.searchParams.set('customBackground', exportOptions.customBackground);
      }
      url.searchParams.set('area', exportOptions.area);
      if (exportOptions.customBounds) {
        url.searchParams.set('bounds', JSON.stringify(exportOptions.customBounds));
      }

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Create download link
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${boardName}-export.${exportOptions.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success('Export completed successfully!');
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const formatOptions = [
    {
      id: 'png',
      name: 'PNG Image',
      description: 'High-quality raster image',
      icon: Image,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      id: 'svg',
      name: 'SVG Vector',
      description: 'Scalable vector graphics',
      icon: Code,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
    {
      id: 'json',
      name: 'JSON Data',
      description: 'Complete board data',
      icon: FileText,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
    },
  ];

  const resolutionOptions = [
    { value: '1x', label: 'Standard (1x)', description: 'Normal resolution' },
    { value: '2x', label: 'High (2x)', description: 'Double resolution for crisp display' },
    { value: '4x', label: 'Ultra (4x)', description: 'Maximum quality for printing' },
  ];

  const backgroundOptions = [
    { value: 'transparent', label: 'Transparent', description: 'No background' },
    { value: 'white', label: 'White', description: 'Clean white background' },
    { value: 'black', label: 'Black', description: 'Dark background' },
    { value: 'custom', label: 'Custom', description: 'Choose your own color' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-xl md:max-w-2xl md:rounded-2xl sm:max-w-lg sm:rounded-2xl max-sm:rounded-none max-sm:max-w-none max-sm:h-[100dvh] max-sm:w-full max-sm:pt-safe max-sm:pb-safe"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Upload className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Export Board</h3>
                    <p className="text-sm text-gray-600">Choose your export format and options</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Format Selection */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Export Format</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {formatOptions.map((format) => {
                      const Icon = format.icon;
                      const isSelected = exportOptions.format === format.id;
                      return (
                        <button
                          key={format.id}
                          onClick={() => setExportOptions(prev => ({ ...prev, format: format.id as any }))}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${format.bgColor} ${format.borderColor} border`}>
                              <Icon className={`h-4 w-4 ${format.color}`} />
                            </div>
                            <div className="text-left">
                              <div className="font-medium text-gray-900 text-sm">{format.name}</div>
                              <div className="text-xs text-gray-600">{format.description}</div>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 right-2">
                              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Resolution Selection (for image formats) */}
                {(exportOptions.format === 'png' || exportOptions.format === 'svg') && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Resolution Quality</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {resolutionOptions.map((option) => {
                        const isSelected = exportOptions.resolution === option.value;
                        return (
                          <button
                            key={option.value}
                            onClick={() => setExportOptions(prev => ({ ...prev, resolution: option.value as any }))}
                            className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="font-medium text-gray-900 text-sm">{option.label}</div>
                              {isSelected && (
                                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                  <Check className="h-2 w-2 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-gray-600">{option.description}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Background Selection (for image formats) */}
                {(exportOptions.format === 'png' || exportOptions.format === 'svg') && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Background Style</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {backgroundOptions.map((option) => {
                        const isSelected = exportOptions.background === option.value;
                        return (
                          <button
                            key={option.value}
                            onClick={() => setExportOptions(prev => ({ ...prev, background: option.value as any }))}
                            className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="font-medium text-gray-900 text-sm">{option.label}</div>
                              {isSelected && (
                                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                  <Check className="h-2 w-2 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-gray-600">{option.description}</div>
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Custom background color picker */}
                    {exportOptions.background === 'custom' && (
                      <div className="mt-3 p-3 rounded-lg border-2 border-blue-200 bg-blue-50">
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          Custom Background Color
                        </label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            value={exportOptions.customBackground || '#ffffff'}
                            onChange={(e) => setExportOptions(prev => ({ 
                              ...prev, 
                              customBackground: e.target.value 
                            }))}
                            className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer"
                          />
                          <div className="flex-1">
                            <input
                              type="text"
                              value={exportOptions.customBackground || '#ffffff'}
                              onChange={(e) => setExportOptions(prev => ({ 
                                ...prev, 
                                customBackground: e.target.value 
                              }))}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                              placeholder="#ffffff"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Export Area */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Export Area</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { id: 'all', label: 'Entire Board', description: 'Export all content' },
                      { id: 'selection', label: 'Selected Area', description: 'Export selected elements' },
                      { id: 'custom', label: 'Custom Area', description: 'Define custom bounds' },
                    ].map((option) => {
                      const isSelected = exportOptions.area === option.id;
                      return (
                        <button
                          key={option.id}
                          onClick={() => setExportOptions(prev => ({ ...prev, area: option.id as any }))}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-medium text-gray-900 text-sm">{option.label}</div>
                            {isSelected && (
                              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                <Check className="h-2 w-2 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-gray-600">{option.description}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Advanced Options */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Advanced Options</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="flex items-center p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeMetadata}
                        onChange={(e) => setExportOptions(prev => ({ 
                          ...prev, 
                          includeMetadata: e.target.checked 
                        }))}
                        className="w-4 h-4 text-blue-500 bg-gray-50 border-gray-300 rounded focus:ring-blue-500 mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900 text-sm">Include Metadata</div>
                        <div className="text-xs text-gray-600">Export board information and timestamps</div>
                      </div>
                    </label>
                    <label className="flex items-center p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exportOptions.compression}
                        onChange={(e) => setExportOptions(prev => ({ 
                          ...prev, 
                          compression: e.target.checked 
                        }))}
                        className="w-4 h-4 text-blue-500 bg-gray-50 border-gray-300 rounded focus:ring-blue-500 mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900 text-sm">Enable Compression</div>
                        <div className="text-xs text-gray-600">Reduce file size for faster downloads</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Export Summary */}
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <Info className="h-4 w-4 text-blue-600" />
                    <div className="text-sm font-medium text-gray-900">Export Summary</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Format:</span>
                        <span className="font-medium text-gray-900">{formatOptions.find(f => f.id === exportOptions.format)?.name}</span>
                      </div>
                      {exportOptions.format !== 'json' && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Resolution:</span>
                            <span className="font-medium text-gray-900">{resolutionOptions.find(r => r.value === exportOptions.resolution)?.label}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Background:</span>
                            <span className="font-medium text-gray-900">{backgroundOptions.find(b => b.value === exportOptions.background)?.label}</span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Area:</span>
                        <span className="font-medium text-gray-900">
                          {exportOptions.area === 'all' ? 'Entire Board' : exportOptions.area === 'selection' ? 'Selected Area' : 'Custom Area'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Metadata:</span>
                        <span className="font-medium text-gray-900">{exportOptions.includeMetadata ? 'Included' : 'Excluded'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Compression:</span>
                        <span className="font-medium text-gray-900">{exportOptions.compression ? 'Enabled' : 'Disabled'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Board:</span> {boardName}
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
                  >
                    {isExporting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Exporting...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        <span>Export Board</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
} 