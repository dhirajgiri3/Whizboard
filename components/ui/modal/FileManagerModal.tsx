import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Search, Upload, Trash2, Edit3, History, Tag, Folder, File, Image, FileText, 
  Grid3X3, List, Eye, Download, MoreVertical, Calendar, HardDrive, User
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

interface FileManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BoardFile {
  id: string;
  name: string;
  type: string;
  size: number;
  metadata: {
    description: string;
    originalName: string;
    [key: string]: any;
  };
  tags: string[];
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

type ViewMode = 'grid' | 'list';

export default function FileManagerModal({ isOpen, onClose }: FileManagerModalProps) {
  const params = useParams();
  const [files, setFiles] = useState<BoardFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<BoardFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'updatedAt' | 'createdAt'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedFile, setSelectedFile] = useState<BoardFile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '', tags: '' });
  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [previewFile, setPreviewFile] = useState<BoardFile | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen) {
      // Defer to ensure element is mounted
      const t = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Keyboard a11y: Esc to close, Tab trap
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!modalRef.current) return;
    if (event.key === 'Escape') {
      event.stopPropagation();
      if (previewFile) {
        setPreviewFile(null);
        return;
      }
      onClose();
      return;
    }

    if (event.key === 'Tab') {
      const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'textarea',
        'input',
        'select',
        '[tabindex]:not([tabindex="-1"])',
      ].join(',');
      const focusable = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(focusableSelectors)
      ).filter(el => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (current === first || !modalRef.current.contains(current)) {
          last.focus();
          event.preventDefault();
        }
      } else {
        if (current === last) {
          first.focus();
          event.preventDefault();
        }
      }
    }
  }, [onClose, previewFile]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFilesUpload(files);
    }
  }, []);

  const handleFilesUpload = async (fileList: File[]) => {
    // Validate file sizes and types
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'text/csv',
      'application/json', 'application/xml',
      'image/svg+xml'
    ];
    
    for (const file of fileList) {
      if (file.size > maxSize) {
        toast.error(`File "${file.name}" is too large. Maximum size is 10MB.`);
        return;
      }
      
      if (!allowedTypes.includes(file.type)) {
        toast.error(`File type "${file.type}" is not supported.`);
        return;
      }
    }

    setIsLoading(true);
    try {
      for (const file of fileList) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', file.name);
        formData.append('description', '');
        formData.append('tags', '');
        formData.append('metadata', JSON.stringify({ originalName: file.name }));

        const response = await fetch(`/api/board/${params.id}/files`, {
          method: 'POST',
          body: formData,
          credentials: 'include' as RequestCredentials,
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error || `Upload failed (${response.status})`);
        }
      }

      toast.success(`${fileList.length} file${fileList.length > 1 ? 's' : ''} uploaded successfully!`);
      await loadFiles();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed. Please try again.');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    await handleFilesUpload(Array.from(files));
  };

  const loadFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/board/${params.id}/files`, { credentials: 'include' as RequestCredentials });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Failed to load files (${response.status})`);
      }
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error('Failed to load files:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load files');
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  const filterFiles = useCallback(() => {
    let filtered = [...files];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(file =>
        file.name.toLowerCase().includes(term) ||
        file.metadata.description.toLowerCase().includes(term) ||
        file.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(file =>
        selectedTags.some(tag => file.tags.includes(tag))
      );
    }

    // Type filter
    if (selectedType) {
      filtered = filtered.filter(file => file.type === selectedType);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'size') {
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredFiles(filtered);
  }, [files, searchTerm, selectedTags, selectedType, sortBy, sortOrder]);

  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  }, [isOpen, loadFiles]);

  useEffect(() => {
    filterFiles();
  }, [filterFiles]);

  const handleFileDelete = async (fileId: string) => {
    if (!confirm('Delete this file?')) return;

    try {
      const response = await fetch(`/api/board/${params.id}/files?fileId=${fileId}`, {
        method: 'DELETE',
        credentials: 'include' as RequestCredentials,
      });

      if (response.ok) {
        toast.success('File deleted successfully!');
        loadFiles();
      } else {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Delete failed (${response.status})`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error instanceof Error ? error.message : 'Delete failed. Please try again.');
    }
  };

  const handleFileUpdate = async () => {
    if (!selectedFile) return;

    try {
      const response = await fetch(`/api/board/${params.id}/files`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId: selectedFile.id,
          updates: {
            name: editForm.name,
            metadata: {
              ...selectedFile.metadata,
              description: editForm.description,
            },
            tags: editForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          },
        }),
        credentials: 'include' as RequestCredentials,
      });

      if (response.ok) {
        toast.success('File updated successfully!');
        setIsEditing(false);
        loadFiles();
      } else {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Update failed (${response.status})`);
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error instanceof Error ? error.message : 'Update failed. Please try again.');
    }
  };

  const loadVersions = async (fileId: string) => {
    try {
      const response = await fetch(`/api/board/${params.id}/files`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId,
          action: 'get_versions',
        }),
        credentials: 'include' as RequestCredentials,
      });

      if (response.ok) {
        const data = await response.json();
        setVersions(data.versions || []);
      }
    } catch (error) {
      console.error('Failed to load versions:', error);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.includes('json')) return FileText;
    if (type.includes('pdf')) return FileText;
    if (type.includes('text/')) return FileText;
    if (type.includes('csv')) return FileText;
    if (type.includes('xml')) return FileText;
    return File;
  };

  const isImageFile = (type: string) => {
    return type.startsWith('image/');
  };

  const getFileTypeColor = (type: string) => {
    if (type.startsWith('image/')) return 'text-blue-600';
    if (type.includes('pdf')) return 'text-red-600';
    if (type.includes('json') || type.includes('xml')) return 'text-green-600';
    if (type.includes('text/') || type.includes('csv')) return 'text-purple-600';
    return 'text-gray-600';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(dateString);
  };

  const handlePreviewFile = (file: BoardFile) => {
    if (isImageFile(file.type)) {
      console.log('Previewing file:', file);
      setPreviewFile(file);
    } else {
      // For non-image files, show a download prompt or open in new tab
      toast.info(`Opening ${file.name}...`);
      // You could implement file download or preview logic here
    }
  };

  const handleDownloadFile = async (file: BoardFile) => {
    try {
      console.log('Downloading file:', file);
      const response = await fetch(`/api/board/${params.id}/files?fileId=${file.id}&action=download`, {
        credentials: 'include' as RequestCredentials,
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('File downloaded successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to download file');
    }
  };

  const allTags = Array.from(
    new Set(
      files
        .flatMap(file => (Array.isArray(file.tags) ? file.tags : []))
        .filter(tag => typeof tag === 'string' && tag.trim() !== '')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
    )
  );
  const allTypes = Array.from(
    new Set(
      files
        .map(file => (typeof file.type === 'string' ? file.type.trim() : ''))
        .filter(type => type && type !== '' && type.length > 0 && type.trim() !== '')
    )
  );

  // Debug logging to identify empty keys
  if (process.env.NODE_ENV === 'development') {
    console.log('allTags:', allTags);
    console.log('allTypes:', allTypes);
    console.log('files:', files);
  }

  // Ensure we have valid data before rendering
  const validAllTags = allTags.filter(tag => tag && tag.trim() !== '');
  const validAllTypes = allTypes.filter(type => type && type.trim() !== '');

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div key="file-manager-modal" className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-6xl bg-white border border-gray-200 rounded-2xl shadow-2xl backdrop-blur-xl md:max-w-6xl md:rounded-2xl sm:max-w-3xl sm:rounded-2xl max-sm:rounded-none max-sm:max-w-none max-sm:h-[100dvh] max-sm:w-full max-sm:pt-safe max-sm:pb-safe"
                role="dialog"
                aria-modal="true"
                aria-labelledby="file-manager-title"
                onKeyDown={handleKeyDown}
                ref={modalRef}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <Folder className="h-6 w-6 text-blue-600" />
                    <h3 id="file-manager-title" className="text-lg font-semibold text-gray-900">File Manager</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
                      aria-label="Upload files"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Upload</span>
                  </button>
                  <button
                    onClick={onClose}
                      className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
                      aria-label="Close file manager"
                  >
                    <X className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                {/* Drag and Drop Zone */}
                <div
                  ref={dropZoneRef}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`mb-6 p-8 border-2 border-dashed rounded-xl text-center transition-all duration-200 ${
                    isDragOver
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                  }`}
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Drop files here or click to upload
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Supports images, PDFs, text files, and more (max 10MB each)
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Choose Files
                  </button>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <label htmlFor="fm-search" className="sr-only">Search files</label>
                      <input
                        id="fm-search"
                        type="text"
                        placeholder="Search files..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        ref={searchInputRef}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {/* View Mode Toggle */}
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-colors ${
                          viewMode === 'grid'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                        aria-label="Grid view"
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-colors ${
                          viewMode === 'list'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                        aria-label="List view"
                      >
                        <List className="h-4 w-4" />
                      </button>
                    </div>

                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      aria-label="Filter by type"
                      className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
                    >
                      <option value="">All Types</option>
                      {validAllTypes.map((type, index) => (
                        <option key={`${type}-${index}`} value={type}>{type}</option>
                      ))}
                    </select>
                    
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      aria-label="Sort by"
                      className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
                    >
                      <option value="updatedAt">Last Modified</option>
                      <option value="name">Name</option>
                      <option value="size">Size</option>
                      <option value="createdAt">Created</option>
                    </select>
                    
                    <button
                      onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                      className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
                      aria-label={`Toggle sort order to ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                  </div>
                </div>

                {/* Tag Filters */}
                {validAllTags.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Filter by Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {validAllTags.map((tag, index) => (
                        <button
                          key={`${tag}-${index}`}
                          onClick={() => setSelectedTags(prev => 
                            prev.includes(tag) 
                              ? prev.filter(t => t !== tag)
                              : [...prev, tag]
                          )}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            selectedTags.includes(tag)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* File List/Grid */}
                <div className="space-y-2 max-h-96 overflow-y-auto" aria-live="polite">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-600">
                      <div className="w-6 h-6 mb-3 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
                      <div className="text-sm">Loading files…</div>
                    </div>
                  ) : filteredFiles.length === 0 ? (
                    <div className="text-center py-12 text-gray-600">
                      <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                        <Folder className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="font-medium">No files found</div>
                      <div className="text-sm text-gray-500">Try adjusting filters or upload new files.</div>
                    </div>
                  ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredFiles.map((file, index) => {
                        const Icon = getFileIcon(file.type);
                        return (
                          <div
                            key={`${file.id || file.name || 'file'}-${index}`}
                            className="group relative bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                          >
                            {/* File Preview/Icon */}
                            <div className="relative mb-3">
                              {isImageFile(file.type) ? (
                                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                  <img
                                    src={`/api/board/${params.id}/files?fileId=${file.id}&action=preview`}
                                    alt={file.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                    onLoad={() => console.log('Grid image loaded:', file.name)}
                                    onError={(e) => {
                                      console.error('Grid image failed to load:', file.name, file.id);
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      target.nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                  <div className="hidden w-full h-full flex items-center justify-center">
                                    <Icon className="h-8 w-8 text-gray-400" />
                                  </div>
                                </div>
                              ) : (
                                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                                  <Icon className={`h-8 w-8 ${getFileTypeColor(file.type)}`} />
                                </div>
                              )}
                              
                              {/* Version Badge */}
                              {file.version > 1 && (
                                <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                                  v{file.version}
                                </div>
                              )}
                            </div>

                            {/* File Info */}
                            <div className="space-y-2">
                              <h4 className="font-medium text-gray-900 truncate text-sm" title={file.name}>
                                {file.name}
                              </h4>
                              <p className="text-xs text-gray-600 truncate">
                                {file.metadata.description || 'No description'}
                              </p>
                              
                              {/* File Meta */}
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>{formatFileSize(file.size)}</span>
                                <span>{getRelativeTime(file.updatedAt)}</span>
                              </div>

                              {/* Tags */}
                              {file.tags && file.tags.length > 0 && file.tags.some(tag => tag && tag.trim()) && (
                                <div className="flex flex-wrap gap-1">
                                  {file.tags.filter(tag => tag && tag.trim()).slice(0, 2).map((tag, tagIndex) => (
                                    <span key={tagIndex} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                      {tag}
                                    </span>
                                  ))}
                                  {file.tags.filter(tag => tag && tag.trim()).length > 2 && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                      +{file.tags.filter(tag => tag && tag.trim()).length - 2}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handlePreviewFile(file)}
                                  className="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  aria-label={`Preview ${file.name}`}
                                >
                                  <Eye className="h-3 w-3 text-gray-600" />
                                </button>
                                <button
                                  onClick={() => handleDownloadFile(file)}
                                  className="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  aria-label={`Download ${file.name}`}
                                >
                                  <Download className="h-3 w-3 text-gray-600" />
                                </button>
                              </div>
                            </div>

                            {/* More Actions Menu */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button
                                onClick={() => {
                                  setSelectedFile(file);
                                  setEditForm({
                                    name: file.name,
                                    description: file.metadata.description || '',
                                    tags: file.tags && file.tags.length > 0 
                                      ? file.tags.filter(tag => tag && tag.trim()).join(', ')
                                      : '',
                                  });
                                  setIsEditing(true);
                                }}
                                className="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-label={`Edit ${file.name}`}
                              >
                                <Edit3 className="h-3 w-3 text-gray-600" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    // List View
                    <div className="space-y-2">
                      {filteredFiles.map((file, index) => {
                        const Icon = getFileIcon(file.type);
                        return (
                          <div
                            key={`${file.id || file.name || 'file'}-${index}`}
                            className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
                          >
                            <Icon className={`h-8 w-8 ${getFileTypeColor(file.type)}`} />
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-gray-900 truncate">{file.name}</h4>
                                {file.version > 1 && (
                                  <span className="px-2 py-1 bg-blue-50 text-blue-600 border border-blue-200 text-xs rounded-full">
                                    v{file.version}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 truncate">
                                {file.metadata.description || 'No description'}
                              </p>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                                <span className="text-xs text-gray-500">{getRelativeTime(file.updatedAt)}</span>
                                {file.tags && file.tags.length > 0 && file.tags.some(tag => tag && tag.trim()) && (
                                  <div className="flex items-center space-x-1">
                                    <Tag className="h-3 w-3 text-gray-400" />
                                    <span className="text-xs text-gray-500">
                                      {file.tags.filter(tag => tag && tag.trim()).join(', ')}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handlePreviewFile(file)}
                                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
                                aria-label={`Preview ${file.name}`}
                              >
                                <Eye className="h-4 w-4 text-gray-700" />
                              </button>
                              <button
                                onClick={() => handleDownloadFile(file)}
                                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
                                aria-label={`Download ${file.name}`}
                              >
                                <Download className="h-4 w-4 text-gray-700" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedFile(file);
                                  setEditForm({
                                    name: file.name,
                                    description: file.metadata.description || '',
                                    tags: file.tags && file.tags.length > 0 
                                      ? file.tags.filter(tag => tag && tag.trim()).join(', ')
                                      : '',
                                  });
                                  setIsEditing(true);
                                }}
                                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
                                aria-label={`Edit ${file.name}`}
                              >
                                <Edit3 className="h-4 w-4 text-gray-700" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedFile(file);
                                  loadVersions(file.id);
                                  setShowVersions(true);
                                }}
                                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
                                aria-label={`View versions of ${file.name}`}
                              >
                                <History className="h-4 w-4 text-gray-700" />
                              </button>
                              <button
                                onClick={() => handleFileDelete(file.id)}
                                className="p-2 rounded-lg bg-gray-100 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-white"
                                aria-label={`Delete ${file.name}`}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="mt-6 p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{files.length}</div>
                      <div className="text-sm text-gray-600">Total Files</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatFileSize(files.reduce((sum, file) => sum + file.size, 0))}
                      </div>
                      <div className="text-sm text-gray-600">Total Size</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{validAllTags.length}</div>
                      <div className="text-sm text-gray-600">Tags</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{validAllTypes.length}</div>
                      <div className="text-sm text-gray-600">File Types</div>
                    </div>
                  </div>
                  
                  {/* Enhanced Stats */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center justify-center space-x-2 text-gray-600">
                        <Image className="h-4 w-4 text-blue-600" />
                        <span>{files.filter(f => isImageFile(f.type)).length} images</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-gray-600">
                        <FileText className="h-4 w-4 text-green-600" />
                        <span>{files.filter(f => f.type.includes('pdf') || f.type.includes('text')).length} documents</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-gray-600">
                        <Calendar className="h-4 w-4 text-purple-600" />
                        <span>{files.filter(f => {
                          const date = new Date(f.updatedAt);
                          const now = new Date();
                          const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
                          return diffHours < 24;
                        }).length} updated today</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Modal */}
              <AnimatePresence>
                {isEditing && selectedFile && (
                  <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                      onClick={() => setIsEditing(false)}
                    />
                    
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="relative w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-2xl"
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="edit-file-title"
                    >
                      <div className="p-6">
                        <h3 id="edit-file-title" className="text-lg font-semibold text-gray-900 mb-4">Edit File</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">Name</label>
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
                            <textarea
                              value={editForm.description}
                              onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                              rows={3}
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">Tags (comma-separated)</label>
                            <input
                              type="text"
                              value={editForm.tags}
                              onChange={(e) => setEditForm(prev => ({ ...prev, tags: e.target.value }))}
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-end space-x-3 mt-6">
                          <button
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleFileUpdate}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Versions Modal */}
              <AnimatePresence>
                {showVersions && selectedFile && (
                  <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                      onClick={() => setShowVersions(false)}
                    />
                    
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="relative w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-2xl"
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="versions-title"
                    >
                      <div className="p-6">
                        <h3 id="versions-title" className="text-lg font-semibold text-gray-900 mb-4">File Versions</h3>
                        
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {versions.map((version, index) => (
                            <div
                              key={`${version.id || version.version || 'version'}-${index}`}
                              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200"
                            >
                              <div>
                                <div className="font-medium text-gray-900">Version {version.version}</div>
                                <div className="text-sm text-gray-600">{formatDate(version.createdAt)}</div>
                              </div>
                              <button
                                onClick={() => {
                                  // Handle version restore
                                  setShowVersions(false);
                                }}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
                              >
                                Restore
                              </button>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-end mt-6">
                          <button
                            onClick={() => setShowVersions(false)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Image Preview Modal */}
              <AnimatePresence>
                {previewFile && (
                  <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/90 backdrop-blur-sm"
                      onClick={() => setPreviewFile(null)}
                    />
                    
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="relative w-full max-w-4xl bg-white border border-gray-200 rounded-xl shadow-2xl"
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="preview-title"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                          <Image className="h-5 w-5 text-blue-600" />
                          <h3 id="preview-title" className="text-lg font-semibold text-gray-900">
                            {previewFile.name}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleDownloadFile(previewFile)}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            aria-label={`Download ${previewFile.name}`}
                          >
                            <Download className="h-4 w-4 text-gray-700" />
                          </button>
                          <button
                            onClick={() => setPreviewFile(null)}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            aria-label="Close preview"
                          >
                            <X className="h-4 w-4 text-gray-700" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Image Preview */}
                      <div className="p-6">
                        <div className="relative">
                          <img
                            src={`/api/board/${params.id}/files?fileId=${previewFile.id}&action=preview`}
                            alt={previewFile.name}
                            className="w-full h-auto max-h-96 object-contain rounded-lg"
                            onLoad={() => console.log('Image loaded successfully:', previewFile.name)}
                            onError={(e) => {
                              console.error('Image failed to load:', previewFile.name, e);
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <div className="hidden w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                            <div className="text-center text-gray-500">
                              <Image className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                              <p>Image preview not available</p>
                              <p className="text-xs mt-1">File ID: {previewFile.id}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* File Details */}
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="font-medium text-gray-900">Size</div>
                              <div className="text-gray-600">{formatFileSize(previewFile.size)}</div>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">Type</div>
                              <div className="text-gray-600">{previewFile.type}</div>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">Modified</div>
                              <div className="text-gray-600">{formatDate(previewFile.updatedAt)}</div>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">Version</div>
                              <div className="text-gray-600">v{previewFile.version}</div>
                            </div>
                          </div>
                          
                          {previewFile.metadata.description && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="font-medium text-gray-900 mb-1">Description</div>
                              <div className="text-gray-600 text-sm">{previewFile.metadata.description}</div>
                            </div>
                          )}
                          
                          {previewFile.tags && previewFile.tags.length > 0 && previewFile.tags.some(tag => tag && tag.trim()) && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="font-medium text-gray-900 mb-2">Tags</div>
                              <div className="flex flex-wrap gap-1">
                                {previewFile.tags.filter(tag => tag && tag.trim()).map((tag, index) => (
                                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
        )}
      </AnimatePresence>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />
    </>
  );
} 