import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  FileText, 
  Image, 
  FolderOpen, 
  Check, 
  Info,
  FileUp,
  Palette,
  Move,
  Settings,
  Zap,
  Download
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/http/axios';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: () => void;
}

interface ImportOptions {
  type: 'json' | 'image' | 'template';
  position: { x: number; y: number };
  scale: number;
  mergeMode: 'replace' | 'append' | 'merge';
  conflictResolution: 'skip' | 'overwrite' | 'rename';
}

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnail: string;
  elements: any[];
}

export default function ImportModal({ isOpen, onClose, onImportComplete }: ImportModalProps) {
  const params = useParams();
  const [isImporting, setIsImporting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    type: 'json',
    position: { x: 100, y: 100 },
    scale: 1,
    mergeMode: 'append',
    conflictResolution: 'rename',
  });
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileSelect(file);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    let type: 'json' | 'image' | 'template' = 'json';
    
    if (file.type.startsWith('image/')) {
      type = 'image';
    } else if (file.name.endsWith('.json')) {
      type = 'json';
    } else if (file.name.endsWith('.template')) {
      type = 'template';
    }

    setSelectedFile(file);
    setImportOptions(prev => ({ ...prev, type }));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedFile && !selectedTemplate) {
      toast.error('Please select a file or template to import');
      return;
    }

    setIsImporting(true);
    try {
      const formData = new FormData();
      
      if (selectedFile) {
        formData.append('file', selectedFile);
        formData.append('type', importOptions.type);
      } else if (selectedTemplate) {
        const templateBlob = new Blob([JSON.stringify(selectedTemplate)], {
          type: 'application/json',
        });
        const templateFile = new File([templateBlob], `${selectedTemplate.name}.template`);
        formData.append('file', templateFile);
        formData.append('type', 'template');
      }

      formData.append('options', JSON.stringify({
        position: importOptions.position,
        scale: importOptions.scale,
        mergeMode: importOptions.mergeMode,
        conflictResolution: importOptions.conflictResolution,
      }));

      const { data: result } = await api.post(`/api/board/${params.id}/import`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(`Successfully imported ${result.importedElements} elements!`);
      onImportComplete?.();
      onClose();
    } catch (error) {
      console.error('Import error:', error);
      toast.error(error instanceof Error ? error.message : 'Import failed. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const { data } = await api.get(`/api/board/${params.id}/import?category=all`);
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const importTypes = [
    {
      id: 'json',
      name: 'JSON Data',
      description: 'Import board data from JSON files',
      icon: FileText,
      extensions: ['.json'],
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      id: 'image',
      name: 'Image Files',
      description: 'Import images as board elements',
      icon: Image,
      extensions: ['.png', '.jpg', '.jpeg', '.svg', '.gif'],
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
    },
    {
      id: 'template',
      name: 'Templates',
      description: 'Import from template library',
      icon: FolderOpen,
      extensions: ['.template'],
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
  ];

  const mergeModes = [
    { value: 'append', label: 'Append', description: 'Add to existing content' },
    { value: 'replace', label: 'Replace', description: 'Replace all content' },
    { value: 'merge', label: 'Merge', description: 'Smart merge with existing' },
  ];

  const conflictResolutions = [
    { value: 'skip', label: 'Skip', description: 'Skip conflicting elements' },
    { value: 'overwrite', label: 'Overwrite', description: 'Replace conflicting elements' },
    { value: 'rename', label: 'Rename', description: 'Rename conflicting elements' },
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
                    <Download className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Import Content</h3>
                    <p className="text-sm text-gray-600">Add files, templates, or data to your board</p>
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
                {/* Import Type Selection */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Import Type</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {importTypes.map((type) => {
                      const Icon = type.icon;
                      const isSelected = importOptions.type === type.id;
                      return (
                        <button
                          key={type.id}
                          onClick={() => {
                            setImportOptions(prev => ({ ...prev, type: type.id as any }));
                            setSelectedFile(null);
                            setSelectedTemplate(null);
                          }}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${type.bgColor} ${type.borderColor} border`}>
                              <Icon className={`h-4 w-4 ${type.color}`} />
                            </div>
                            <div className="text-left">
                              <div className="font-medium text-gray-900 text-sm">{type.name}</div>
                              <div className="text-xs text-gray-600">{type.description}</div>
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

                {/* File Upload Area */}
                {importOptions.type !== 'template' && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Select File</h4>
                    <div
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                        dragActive
                          ? 'border-blue-500 bg-blue-50'
                          : selectedFile
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      {selectedFile ? (
                        <div className="space-y-3">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <Check className="h-6 w-6 text-green-600" />
                          </div>
                          <div className="text-gray-900 font-medium">{selectedFile.name}</div>
                          <div className="text-sm text-gray-600">
                            {(selectedFile.size / 1024).toFixed(1)} KB
                          </div>
                          <button
                            onClick={() => setSelectedFile(null)}
                            className="text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium"
                          >
                            Change file
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                            <Download className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="text-gray-900 font-medium">Drop file here or click to browse</div>
                          <div className="text-sm text-gray-600">
                            Supports {importTypes.find(t => t.id === importOptions.type)?.extensions.join(', ')}
                          </div>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                          >
                            Browse Files
                          </button>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={importTypes.find(t => t.id === importOptions.type)?.extensions.join(',')}
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </div>
                )}

                {/* Template Selection */}
                {importOptions.type === 'template' && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-900">Select Template</h4>
                      <button
                        onClick={() => {
                          if (templates.length === 0) {
                            loadTemplates();
                          }
                          setShowTemplates(!showTemplates);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium"
                      >
                        {showTemplates ? 'Hide' : 'Browse'} Templates
                      </button>
                    </div>
                    
                    {showTemplates && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                        {templates.map((template) => {
                          const isSelected = selectedTemplate?.id === template.id;
                          return (
                            <button
                              key={template.id}
                              onClick={() => setSelectedTemplate(template)}
                              className={`p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 bg-white hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <div className="font-medium text-gray-900 text-sm">{template.name}</div>
                                {isSelected && (
                                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                    <Check className="h-2 w-2 text-white" />
                                  </div>
                                )}
                              </div>
                              <div className="text-xs text-gray-600 mb-2">{template.description}</div>
                              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block">
                                {template.category}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                    
                    {selectedTemplate && (
                      <div className="p-3 rounded-xl bg-green-50 border-2 border-green-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <Check className="h-3 w-3 text-green-600" />
                          </div>
                          <div>
                            <div className="text-gray-900 font-medium text-sm">{selectedTemplate.name}</div>
                            <div className="text-xs text-gray-600">{selectedTemplate.description}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Import Options */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Import Options</h4>
                  
                  {/* Merge Mode */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-700 mb-2">Merge Mode</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {mergeModes.map((mode) => {
                        const isSelected = importOptions.mergeMode === mode.value;
                        return (
                          <button
                            key={mode.value}
                            onClick={() => setImportOptions(prev => ({ ...prev, mergeMode: mode.value as any }))}
                            className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="font-medium text-gray-900 text-sm">{mode.label}</div>
                              {isSelected && (
                                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                  <Check className="h-2 w-2 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-gray-600">{mode.description}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Conflict Resolution */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-700 mb-2">Conflict Resolution</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {conflictResolutions.map((resolution) => {
                        const isSelected = importOptions.conflictResolution === resolution.value;
                        return (
                          <button
                            key={resolution.value}
                            onClick={() => setImportOptions(prev => ({ ...prev, conflictResolution: resolution.value as any }))}
                            className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="font-medium text-gray-900 text-sm">{resolution.label}</div>
                              {isSelected && (
                                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                  <Check className="h-2 w-2 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-gray-600">{resolution.description}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Scale and Position */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Scale</label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="range"
                          min="0.1"
                          max="3"
                          step="0.1"
                          value={importOptions.scale}
                          onChange={(e) => setImportOptions(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-sm text-gray-600 font-medium w-8">{importOptions.scale}x</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Position Offset</label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">X</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={importOptions.position.x}
                            onChange={(e) => setImportOptions(prev => ({ 
                              ...prev, 
                              position: { ...prev.position, x: parseInt(e.target.value) || 0 } 
                            }))}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Y</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={importOptions.position.y}
                            onChange={(e) => setImportOptions(prev => ({ 
                              ...prev, 
                              position: { ...prev.position, y: parseInt(e.target.value) || 0 } 
                            }))}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Import Summary */}
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <Info className="h-4 w-4 text-blue-600" />
                    <div className="text-sm font-medium text-gray-900">Import Summary</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium text-gray-900">{importTypes.find(t => t.id === importOptions.type)?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mode:</span>
                        <span className="font-medium text-gray-900">{mergeModes.find(m => m.value === importOptions.mergeMode)?.label}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Scale:</span>
                        <span className="font-medium text-gray-900">{importOptions.scale}x</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Position:</span>
                        <span className="font-medium text-gray-900">({importOptions.position.x}, {importOptions.position.y})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Conflict:</span>
                        <span className="font-medium text-gray-900">{conflictResolutions.find(r => r.value === importOptions.conflictResolution)?.label}</span>
                      </div>
                      {selectedFile && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">File:</span>
                          <span className="font-medium text-gray-900 truncate">{selectedFile.name}</span>
                        </div>
                      )}
                      {selectedTemplate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Template:</span>
                          <span className="font-medium text-gray-900">{selectedTemplate.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Board:</span> {params.id}
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={isImporting || (!selectedFile && !selectedTemplate)}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
                  >
                    {isImporting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Importing...</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        <span>Import Content</span>
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