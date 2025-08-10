"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Folder,
  File,
  Upload,
  Download,
  Trash2,
  Search,
  Plus,
  ExternalLink,
  Image,
  FileText,
  Archive,
  ArrowLeft,
  RefreshCw,
  X
} from 'lucide-react';
import { useGoogleDrive, GoogleDriveFile, GoogleDriveFolder } from '@/hooks/useGoogleDrive';
import { toast } from 'sonner';

interface GoogleDriveManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect?: (file: GoogleDriveFile) => void;
  onFolderSelect?: (folder: GoogleDriveFolder) => void;
  allowUpload?: boolean;
  allowDownload?: boolean;
  allowDelete?: boolean;
  allowCreateFolder?: boolean;
  showSearch?: boolean;
  title?: string;
}

export function GoogleDriveManager({
  isOpen,
  onClose,
  onFileSelect,
  onFolderSelect,
  allowUpload = true,
  allowDownload = true,
  allowDelete = true,
  allowCreateFolder = true,
  showSearch = true,
  title = "Google Drive"
}: GoogleDriveManagerProps) {
  const {
    isLoading,
    files,
    listFiles,
    searchFiles,
    uploadFile,
    downloadFile,
    deleteFile,
    createFolder,
  } = useGoogleDrive();

  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFile, setSelectedFile] = useState<GoogleDriveFile | null>(null);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  }, [isOpen, currentFolderId]);

  // Load Whizboard folder info when component mounts
  useEffect(() => {
    if (isOpen && !currentFolderId) {
      // Show Whizboard folder info in the current directory
      const whizboardFolder = files.find(f => f.mimeType === 'application/vnd.google-apps.folder' && f.name === 'Whizboard');
      if (whizboardFolder) {
        // Highlight the Whizboard folder
        console.log('Whizboard folder found:', whizboardFolder);
      }
    }
  }, [isOpen, files, currentFolderId]);

  const loadFiles = async () => {
    if (isSearching) {
      await searchFiles(searchQuery);
    } else {
      await listFiles(currentFolderId);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsSearching(true);
      await searchFiles(query);
    } else {
      setIsSearching(false);
      await listFiles(currentFolderId);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingFile(file);
    try {
      const result = await uploadFile(file, undefined, undefined, currentFolderId);
      if (result.success) {
        await loadFiles();
        setUploadingFile(null);
        if (event.target) {
          event.target.value = '';
        }
      }
    } catch (error) {
      setUploadingFile(null);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    const folder = await createFolder(newFolderName, currentFolderId);
    if (folder) {
      setShowCreateFolder(false);
      setNewFolderName('');
      await loadFiles();
    }
  };

  const handleFileClick = (file: GoogleDriveFile) => {
    if (file.mimeType === 'application/vnd.google-apps.folder') {
      setCurrentFolderId(file.id);
    } else {
      setSelectedFile(file);
      onFileSelect?.(file);
    }
  };

  const handleFolderClick = (folder: GoogleDriveFolder) => {
    setCurrentFolderId(folder.id);
    onFolderSelect?.(folder);
  };

  const handleBackToParent = () => {
    setCurrentFolderId(undefined);
  };

  const handleDownload = async (file: GoogleDriveFile) => {
    await downloadFile(file.id);
  };

  const handleDelete = async (file: GoogleDriveFile) => {
    if (confirm(`Are you sure you want to delete "${file.name}"?`)) {
      const success = await deleteFile(file.id);
      if (success) {
        await loadFiles();
      }
    }
  };

  const getFileIcon = (file: GoogleDriveFile) => {
    if (file.mimeType === 'application/vnd.google-apps.folder') {
      return <Folder className="w-5 h-5 text-blue-500" />;
    }
    
    if (file.mimeType.startsWith('image/')) {
      return <Image className="w-5 h-5 text-green-500" />;
    }
    
    if (file.mimeType.includes('json') || file.mimeType.includes('text')) {
      return <FileText className="w-5 h-5 text-purple-500" />;
    }
    
    if (file.mimeType.includes('zip') || file.mimeType.includes('archive')) {
      return <Archive className="w-5 h-5 text-orange-500" />;
    }
    
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (size?: string) => {
    if (!size) return '';
    const bytes = parseInt(size);
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col bg-[#111111] border border-white/[0.08]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            {isLoading && <RefreshCw className="w-4 h-4 animate-spin text-white/70" />}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-white/70 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 p-4 border-b border-white/[0.08]">
          {currentFolderId && (
            <button
              onClick={handleBackToParent}
              className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/[0.06] rounded-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}

          {showSearch && (
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/[0.02] border border-white/[0.08] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {allowUpload && (
            <label className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500">
              <Upload className="w-4 h-4" />
              Upload
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploadingFile !== null}
              />
            </label>
          )}

          {allowCreateFolder && (
            <button
              onClick={() => setShowCreateFolder(true)}
              className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <Plus className="w-4 h-4" />
              New Folder
            </button>
          )}
        </div>

        {/* Create Folder Modal */}
        {showCreateFolder && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
            <div className="w-96 rounded-2xl p-6 bg-white/[0.03] border border-white/[0.08]">
              <h3 className="text-lg font-semibold mb-4 text-white">Create New Folder</h3>
              <input
                type="text"
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full px-3 py-2 mb-4 rounded-lg bg-white/[0.02] border border-white/[0.08] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
              />
              <div className="flex gap-3">
                <button
                  onClick={handleCreateFolder}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCreateFolder(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-white/[0.06] border border-white/[0.12] text-white hover:bg-white/[0.1]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* File List */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading && !files.length ? (
            <div className="flex items-center justify-center h-full">
              <RefreshCw className="w-6 h-6 animate-spin text-white/60" />
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/60">
              <Folder className="w-16 h-16 mb-4" />
              <p className="text-lg font-medium">No files found</p>
              <p className="text-sm">Upload files or create folders to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.06] hover:border-white/[0.12] cursor-pointer"
                  onClick={() => handleFileClick(file)}
                >
                  <div className="flex items-start gap-3">
                    {getFileIcon(file)}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate">{file.name}</h3>
                      <p className="text-sm text-white/60">{formatFileSize(file.size)} • {formatDate(file.modifiedTime)}</p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      {file.webViewLink && (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-white/60 hover:text-blue-300"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      {allowDownload && file.mimeType !== 'application/vnd.google-apps.folder' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(file);
                          }}
                          className="p-1 text-white/60 hover:text-emerald-300"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                      {allowDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(file);
                          }}
                          className="p-1 text-white/60 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Upload Progress */}
        {uploadingFile && (
          <div className="p-4 border-t border-white/[0.08]">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
              <span className="text-sm text-white/80">Uploading {uploadingFile.name}...</span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
