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
  Upload,
  Maximize,
  Monitor,
  Smartphone,
  Cloud,
  Folder,
  ExternalLink,
  BarChart3
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useGoogleDrive } from '@/hooks/useGoogleDrive';
import { GoogleDriveManager } from '@/components/ui/google-drive/GoogleDriveManager';
import { GoogleDriveDashboard } from '@/components/ui/google-drive/GoogleDriveDashboard';
import api from '@/lib/http/axios';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardName: string;
  // Add canvas state props for better export
  currentZoom?: number;
  stagePosition?: { x: number; y: number };
  canvasBounds?: { x: number; y: number; width: number; height: number };
}

interface ExportOptions {
  format: 'png' | 'svg' | 'json';
  resolution: '1x' | '2x' | '4x' | '8x';
  background: 'transparent' | 'white' | 'black' | 'custom';
  customBackground?: string;
  area: 'all' | 'selection' | 'custom' | 'viewport';
  customBounds?: { x: number; y: number; width: number; height: number };
  includeMetadata: boolean;
  compression: boolean;
  includeViewportInfo: boolean;
  quality: 'standard' | 'high' | 'ultra';
}

export default function ExportModal({ 
  isOpen, 
  onClose, 
  boardName,
  currentZoom = 100,
  stagePosition = { x: 0, y: 0 },
  canvasBounds
}: ExportModalProps) {
  const params = useParams();
  const [isExporting, setIsExporting] = useState(false);
  const [showGoogleDriveManager, setShowGoogleDriveManager] = useState(false);
  const [showGoogleDriveDashboard, setShowGoogleDriveDashboard] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>();
  const { exportBoardToGoogleDrive } = useGoogleDrive();
  const [shareToSlack, setShareToSlack] = useState(false);
  const [isSharingToSlack, setIsSharingToSlack] = useState(false);
  const [slackChannelId, setSlackChannelId] = useState<string>('');
  const [slackChannels, setSlackChannels] = useState<Array<{ id: string; name: string }>>([]);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'png',
    resolution: '2x',
    background: 'transparent',
    area: 'all',
    includeMetadata: true,
    compression: true,
    includeViewportInfo: true,
    quality: 'high',
  });

  const handleExport = async (saveToGoogleDrive = false) => {
    if (isExporting) return;

    setIsExporting(true);
    try {
      if (saveToGoogleDrive) {
        // Export to Google Drive
        const result = await exportBoardToGoogleDrive(
          params.id as string,
          exportOptions.format,
          {
            resolution: exportOptions.resolution,
            background: exportOptions.background,
            area: exportOptions.area,
            quality: exportOptions.quality,
            includeMetadata: exportOptions.includeMetadata,
            compression: exportOptions.compression,
            folderId: selectedFolderId,
          }
        );

        if (result.success) {
          toast.success('Board exported successfully to Google Drive!', {
            description: result.googleDriveUrl ? (
              <a 
                href={result.googleDriveUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View in Google Drive
              </a>
            ) : undefined,
            duration: 5000,
          });
          onClose();
        } else {
          throw new Error(result.error || 'Failed to export to Google Drive');
        }
      } else {
        // Regular download export
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
        
        // Add viewport information for better export
        if (exportOptions.includeViewportInfo) {
          url.searchParams.set('viewport', JSON.stringify({
            zoom: currentZoom,
            position: stagePosition,
            bounds: canvasBounds
          }));
        }
        
        // Add quality settings
        url.searchParams.set('quality', exportOptions.quality);
        url.searchParams.set('includeMetadata', exportOptions.includeMetadata.toString());
        url.searchParams.set('compression', exportOptions.compression.toString());

        const response = await api.get(url.toString(), { responseType: 'blob' });
        if (response.status < 200 || response.status >= 300) {
          const errorText = typeof response.data === 'string' ? response.data : '';
          console.error('Export failed:', response.status, errorText);
          throw new Error(`Export failed: ${response.status}`);
        }

        // Create download link
        const blob = response.data as Blob;
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        
        // Determine file extension based on format and content type
        let fileExtension = exportOptions.format;
        const contentType = response.headers['content-type'] as string | undefined;
        if (contentType?.includes('svg')) {
          fileExtension = 'svg';
        } else if (contentType?.includes('json')) {
          fileExtension = 'json';
        }
        
        // Create descriptive filename
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const qualitySuffix = exportOptions.quality !== 'standard' ? `-${exportOptions.quality}` : '';
        const resolutionSuffix = exportOptions.resolution !== '1x' ? `-${exportOptions.resolution}` : '';
        link.download = `${boardName}-export${qualitySuffix}${resolutionSuffix}-${timestamp}.${fileExtension}`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        toast.success('Export completed successfully!', {
          description: `File saved as ${link.download}`,
          duration: 5000,
        });

        // Optionally share to Slack
        if (shareToSlack) {
          try {
            setIsSharingToSlack(true);
            const formData = new FormData();
            formData.append('file', blob, link.download);
            formData.append('filename', link.download);
            if (slackChannelId) formData.append('channelId', slackChannelId);
            await api.post('/api/integrations/slack/upload', formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
          } finally {
            setIsSharingToSlack(false);
          }
        }
        onClose();
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    { value: '8x', label: 'Extreme (8x)', description: 'Ultra-high quality for large prints' },
  ];

  const qualityOptions = [
    { value: 'standard', label: 'Standard', description: 'Good quality, smaller file size' },
    { value: 'high', label: 'High', description: 'Better quality, balanced file size' },
    { value: 'ultra', label: 'Ultra', description: 'Maximum quality, larger file size' },
  ];

  const backgroundOptions = [
    { value: 'transparent', label: 'Transparent', description: 'No background' },
    { value: 'white', label: 'White', description: 'Clean white background' },
    { value: 'black', label: 'Black', description: 'Dark background' },
    { value: 'custom', label: 'Custom', description: 'Choose your own color' },
  ];

  const areaOptions = [
    { id: 'all', label: 'Entire Canvas', description: 'Export all content' },
    { id: 'viewport', label: 'Current View', description: 'Export visible area only' },
    { id: 'selection', label: 'Selected Area', description: 'Export selected elements' },
    { id: 'custom', label: 'Custom Area', description: 'Define custom bounds' },
  ];

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div key="export-modal" className="fixed inset-0 z-50 overflow-y-auto">
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
              className="relative w-full max-w-3xl bg-white border border-gray-200 rounded-2xl shadow-xl md:max-w-3xl md:rounded-2xl sm:max-w-lg sm:rounded-2xl max-sm:rounded-none max-sm:max-w-none max-sm:h-[100dvh] max-sm:w-full max-sm:pt-safe max-sm:pb-safe"
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
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
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

                {/* Export Area */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Export Area</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {areaOptions.map((option) => {
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

                {/* Resolution and Quality (for image formats) */}
                {(exportOptions.format === 'png' || exportOptions.format === 'svg') && (
                  <>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Resolution Quality</h4>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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

                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Quality Settings</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {qualityOptions.map((option) => {
                          const isSelected = exportOptions.quality === option.value;
                          return (
                            <button
                              key={option.value}
                              onClick={() => setExportOptions(prev => ({ ...prev, quality: option.value as any }))}
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
                  </>
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

                {/* Custom bounds input */}
                {exportOptions.area === 'custom' && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Custom Export Bounds</h4>
                    <div className="p-3 rounded-lg border-2 border-blue-200 bg-blue-50">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">X</label>
                          <input
                            type="number"
                            value={exportOptions.customBounds?.x || 0}
                            onChange={(e) => setExportOptions(prev => ({ 
                              ...prev, 
                              customBounds: { 
                                x: parseInt(e.target.value) || 0,
                                y: prev.customBounds?.y || 0,
                                width: prev.customBounds?.width || 800,
                                height: prev.customBounds?.height || 600
                              }
                            }))}
                            className="w-full px-2 py-1 rounded border border-gray-300 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Y</label>
                          <input
                            type="number"
                            value={exportOptions.customBounds?.y || 0}
                            onChange={(e) => setExportOptions(prev => ({ 
                              ...prev, 
                              customBounds: { 
                                x: prev.customBounds?.x || 0,
                                y: parseInt(e.target.value) || 0,
                                width: prev.customBounds?.width || 800,
                                height: prev.customBounds?.height || 600
                              }
                            }))}
                            className="w-full px-2 py-1 rounded border border-gray-300 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Width</label>
                          <input
                            type="number"
                            value={exportOptions.customBounds?.width || 800}
                            onChange={(e) => setExportOptions(prev => ({ 
                              ...prev, 
                              customBounds: { 
                                x: prev.customBounds?.x || 0,
                                y: prev.customBounds?.y || 0,
                                width: parseInt(e.target.value) || 800,
                                height: prev.customBounds?.height || 600
                              }
                            }))}
                            className="w-full px-2 py-1 rounded border border-gray-300 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Height</label>
                          <input
                            type="number"
                            value={exportOptions.customBounds?.height || 600}
                            onChange={(e) => setExportOptions(prev => ({ 
                              ...prev, 
                              customBounds: { 
                                x: prev.customBounds?.x || 0,
                                y: prev.customBounds?.y || 0,
                                width: prev.customBounds?.width || 800,
                                height: parseInt(e.target.value) || 600
                              }
                            }))}
                            className="w-full px-2 py-1 rounded border border-gray-300 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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
                    <label className="flex items-center p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeViewportInfo}
                        onChange={(e) => setExportOptions(prev => ({ 
                          ...prev, 
                          includeViewportInfo: e.target.checked 
                        }))}
                        className="w-4 h-4 text-blue-500 bg-gray-50 border-gray-300 rounded focus:ring-blue-500 mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900 text-sm">Include Viewport Info</div>
                        <div className="text-xs text-gray-600">Include current zoom and position data</div>
                      </div>
                    </label>
                    <label className="flex items-center p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={shareToSlack}
                        onChange={(e) => setShareToSlack(e.target.checked)}
                        className="w-4 h-4 text-blue-500 bg-gray-50 border-gray-300 rounded focus:ring-blue-500 mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900 text-sm">Share to Slack</div>
                        <div className="text-xs text-gray-600">Post a message in your default Slack channel</div>
                      </div>
                    </label>
                    {shareToSlack && (
                      <div className="p-3 rounded-lg border-2 border-blue-200 bg-blue-50">
                        <div className="text-xs text-gray-700 mb-2">Optional: choose Slack channel</div>
                        <div className="flex gap-2">
                          <select
                            value={slackChannelId}
                            onChange={(e) => setSlackChannelId(e.target.value)}
                            className="flex-1 px-2 py-2 rounded border border-gray-300 text-sm bg-white"
                          >
                            <option value="">Use default channel</option>
                            {slackChannels
                              .filter((c) => c.id && c.id.trim() !== '') // Filter out empty IDs
                              .map((c, index) => (
                                <option key={c.id || `channel-${index}`} value={c.id}>#{c.name}</option>
                              ))}
                          </select>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const res = await api.get('/api/integrations/slack/channels');
                                const channels = res.data.channels || [];
                                // Filter out channels with empty or invalid IDs and ensure uniqueness
                                const validChannels = channels
                                  .filter((c: any) => c && c.id && c.id.trim() !== '' && c.name)
                                  .filter((c: any, index: number, arr: any[]) => 
                                    arr.findIndex(ch => ch.id === c.id) === index
                                  );
                                setSlackChannels(validChannels);
                              } catch (e) {
                                // no-op
                              }
                            }}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm"
                          >
                            Load Channels
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Google Drive Integration */}
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Cloud className="h-4 w-4 text-blue-600" />
                      <div className="text-sm font-medium text-gray-900">Google Drive Export</div>
                    </div>
                    <button
                      onClick={() => setShowGoogleDriveDashboard(true)}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      <BarChart3 className="w-3 h-3" />
                      Dashboard
                    </button>
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs text-gray-600">
                      Export directly to your Google Drive for easy sharing and collaboration. Files will be saved to your "Whizboard" folder by default.
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowGoogleDriveManager(true)}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50"
                      >
                        <Folder className="w-4 h-4" />
                        {selectedFolderId ? 'Change Folder' : 'Select Folder'}
                      </button>
                      {selectedFolderId && (
                        <button
                          onClick={() => setSelectedFolderId(undefined)}
                          className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    {selectedFolderId && (
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Selected folder:</span> {selectedFolderId}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-blue-700">
                      <ExternalLink className="w-3 h-3" />
                      <span>Access your Google Drive dashboard for file management and statistics</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                      <Folder className="w-3 h-3" />
                      <span>Files will be automatically saved to your "Whizboard" folder</span>
                    </div>
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
                            <span className="text-gray-600">Quality:</span>
                            <span className="font-medium text-gray-900">{qualityOptions.find(q => q.value === exportOptions.quality)?.label}</span>
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
                          {areaOptions.find(a => a.id === exportOptions.area)?.label}
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
                      <div className="flex justify-between">
                        <span className="text-gray-600">Viewport Info:</span>
                        <span className="font-medium text-gray-900">{exportOptions.includeViewportInfo ? 'Included' : 'Excluded'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Board:</span> {boardName}
                  {currentZoom && (
                    <span className="ml-2">
                      • Zoom: {Math.round(currentZoom)}%
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleExport(false)}
                    disabled={isExporting}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
                  >
                    {isExporting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Exporting...</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleExport(true)}
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
                        <Cloud className="h-4 w-4" />
                        <span>Export to Drive</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Google Drive Manager */}
      <GoogleDriveManager
        key="google-drive-manager"
        isOpen={showGoogleDriveManager}
        onClose={() => setShowGoogleDriveManager(false)}
        onFolderSelect={(folder) => {
          setSelectedFolderId(folder.id);
          setShowGoogleDriveManager(false);
        }}
        allowUpload={false}
        allowDownload={false}
        allowDelete={false}
        allowCreateFolder={true}
        showSearch={true}
        title="Select Google Drive Folder"
      />

      {/* Google Drive Dashboard */}
      <GoogleDriveDashboard
        key="google-drive-dashboard"
        isOpen={showGoogleDriveDashboard}
        onClose={() => setShowGoogleDriveDashboard(false)}
      />
    </AnimatePresence>
  );
} 