"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Image, FileText, Download, ExternalLink } from 'lucide-react';
import { useGoogleDrive, GoogleDriveFile } from '@/hooks';
import { toast } from 'sonner';

interface GoogleDrivePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelect: (imageData: { src: string; width: number; height: number; alt?: string }) => void;
}

export default function GoogleDrivePickerModal({
  isOpen,
  onClose,
  onImageSelect,
}: GoogleDrivePickerModalProps) {
  const { files, listFiles, searchFiles, downloadFile, isLoading } = useGoogleDrive();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFile, setSelectedFile] = useState<GoogleDriveFile | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  }, [isOpen]);

  const loadFiles = async () => {
    if (isSearching) {
      await searchFiles(searchQuery);
    } else {
      await listFiles();
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsSearching(true);
      await searchFiles(query);
    } else {
      setIsSearching(false);
      await listFiles();
    }
  };

  const handleFileSelect = async (file: GoogleDriveFile) => {
    setSelectedFile(file);
  };

  const handleImagePlacement = async () => {
    if (!selectedFile) return;

    setIsDownloading(true);
    try {
      // Download the file
      const result = await downloadFile(selectedFile.id);
      
      if (result.success && result.data) {
        // Convert ArrayBuffer to base64
        const bytes = new Uint8Array(result.data);
        const binary = bytes.reduce((data, byte) => data + String.fromCharCode(byte), '');
        const base64 = btoa(binary);
        const dataUrl = `data:${result.mimeType};base64,${base64}`;

        // Create image element data
        const imageData = {
          src: dataUrl,
          width: 300, // Default width
          height: 200, // Default height
          alt: selectedFile.name,
        };

        onImageSelect(imageData);
        onClose();
        toast.success('Image added to canvas!');
      } else {
        toast.error('Failed to download image');
      }
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Failed to download image');
    } finally {
      setIsDownloading(false);
    }
  };

  const getFileIcon = (file: GoogleDriveFile) => {
    if (file.mimeType?.startsWith('image/')) {
      return <Image className="w-5 h-5 text-emerald-400" />;
    } else if (file.mimeType === 'application/vnd.google-apps.folder') {
      return <div className="w-5 h-5 text-blue-400">📁</div>;
    } else {
      return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const isImageFile = (file: GoogleDriveFile) => {
    return file.mimeType?.startsWith('image/');
  };

  const imageFiles = files.filter(isImageFile);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Select Image from Google Drive</h2>
                <p className="text-sm text-gray-500 mt-1">Choose an image to add to your canvas</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="p-6 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for images..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <div className="h-96 overflow-y-auto p-6">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : imageFiles.length === 0 ? (
                  <div className="text-center py-12">
                    <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
                    <p className="text-gray-500">
                      {isSearching ? 'No images match your search.' : 'Upload some images to Google Drive to get started.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {imageFiles.map((file) => (
                      <div
                        key={file.id}
                        onClick={() => handleFileSelect(file)}
                        className={`
                          relative group cursor-pointer rounded-lg border-2 transition-all duration-200
                          ${selectedFile?.id === file.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }
                        `}
                      >
                        <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                          {file.thumbnailLink ? (
                            <img
                              src={file.thumbnailLink}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Image className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {file.size ? `${(parseInt(file.size) / 1024 / 1024).toFixed(1)} MB` : 'Unknown size'}
                          </p>
                        </div>
                        {selectedFile?.id === file.id && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center gap-4">
                {selectedFile && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Image className="w-4 h-4" />
                    <span>{selectedFile.name}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImagePlacement}
                  disabled={!selectedFile || isDownloading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isDownloading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Add to Canvas
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
