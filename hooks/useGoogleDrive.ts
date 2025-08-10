import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime: string;
  modifiedTime: string;
  parents?: string[];
  webViewLink?: string;
  thumbnailLink?: string;
}

export interface GoogleDriveFolder {
  id: string;
  name: string;
  mimeType: 'application/vnd.google-apps.folder';
  createdTime: string;
  modifiedTime: string;
  parents?: string[];
}

export interface UploadResult {
  success: boolean;
  fileId?: string;
  error?: string;
  file?: GoogleDriveFile;
}

export interface DownloadResult {
  success: boolean;
  data?: ArrayBuffer;
  error?: string;
  fileName?: string;
  mimeType?: string;
}

export function useGoogleDrive() {
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [folders, setFolders] = useState<GoogleDriveFolder[]>([]);

  const listFiles = useCallback(async (folderId?: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (folderId) {
        params.append('folderId', folderId);
      }

      const response = await fetch(`/api/integrations/google-drive/files?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Failed to fetch files: ${response.status} ${response.statusText}`;
        
        // Check for specific API errors
        if (response.status === 403 && errorData.error?.includes('API has not been used')) {
          toast.error('Google Drive API not enabled. Please enable it in Google Cloud Console.', {
            description: 'Click here to enable the API',
            action: {
              label: 'Enable API',
              onClick: () => window.open('https://console.developers.google.com/apis/api/drive.googleapis.com/overview', '_blank')
            },
            duration: 10000,
          });
        } else if (response.status === 401) {
          toast.error('Google Drive not connected. Please connect your account in settings.');
        } else {
          toast.error(errorMessage);
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setFiles(data.files || []);
      return data.files || [];
    } catch (error) {
      console.error('Error listing files:', error);
      // Don't show duplicate toast if already shown above
      if (!error.message?.includes('Google Drive API not enabled') && !error.message?.includes('Google Drive not connected')) {
        toast.error('Failed to load Google Drive files');
      }
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchFiles = useCallback(async (query: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('query', query);

      const response = await fetch(`/api/integrations/google-drive/files?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to search files');
      }

      const data = await response.json();
      setFiles(data.files || []);
      return data.files || [];
    } catch (error) {
      console.error('Error searching files:', error);
      toast.error('Failed to search Google Drive files');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadFile = useCallback(async (
    file: File | string,
    fileName?: string,
    mimeType?: string,
    parentFolderId?: string
  ): Promise<UploadResult> => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      
      if (typeof file === 'string') {
        // Handle string data (e.g., JSON content)
        formData.append('data', file);
        formData.append('fileName', fileName || 'file.json');
        formData.append('mimeType', mimeType || 'application/json');
      } else {
        // Handle File object
        formData.append('file', file);
        if (fileName) {
          formData.append('fileName', fileName);
        }
        if (mimeType) {
          formData.append('mimeType', mimeType);
        }
      }

      if (parentFolderId) {
        formData.append('parentFolderId', parentFolderId);
      }

      const response = await fetch('/api/integrations/google-drive/files', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }

      const result = await response.json();
      toast.success('File uploaded successfully to Google Drive');
      return result;
    } catch (error) {
      console.error('Error uploading file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const downloadFile = useCallback(async (fileId: string): Promise<DownloadResult> => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/integrations/google-drive/download?fileId=${fileId}`);
      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const data = await response.arrayBuffer();
      const fileName = response.headers.get('content-disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'download';
      const mimeType = response.headers.get('content-type') || 'application/octet-stream';

      // Create download link
      const blob = new Blob([data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('File downloaded successfully');
      return {
        success: true,
        data,
        fileName,
        mimeType,
      };
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
      return { success: false, error: 'Failed to download file' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteFile = useCallback(async (fileId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/integrations/google-drive/files?fileId=${fileId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      toast.success('File deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createFolder = useCallback(async (name: string, parentFolderId?: string): Promise<GoogleDriveFolder | null> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/integrations/google-drive/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, parentFolderId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create folder');
      }

      const result = await response.json();
      toast.success('Folder created successfully');
      return result.folder;
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Failed to create folder');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

    const getWhizboardFolder = useCallback(async (): Promise<{ success: boolean; folderId?: string; error?: string }> => {
    try {
      const response = await fetch('/api/integrations/google-drive/folders/whizboard');
      if (!response.ok) {
        throw new Error('Failed to get Whizboard folder');
      }
      const data = await response.json();
      return { success: true, folderId: data.folderId };
    } catch (error) {
      console.error('Error getting Whizboard folder:', error);
      return { success: false, error: 'Failed to get Whizboard folder' };
    }
  }, []);

  const exportBoardToGoogleDrive = useCallback(async (
    boardId: string, 
    format: 'png' | 'svg' | 'json' = 'png', 
    options: {
      resolution?: string;
      background?: string;
      area?: string;
      quality?: string;
      includeMetadata?: boolean;
      compression?: boolean;
      folderId?: string;
    } = {}
  ): Promise<{ success: boolean; fileId?: string; error?: string; googleDriveUrl?: string }> => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        format,
        saveToGoogleDrive: 'true',
        ...options,
      });

      if (options.folderId) {
        params.append('googleDriveFolderId', options.folderId);
      }

      const response = await fetch(`/api/board/${boardId}/export?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to export board');
      }

      const result = await response.json();
      toast.success('Board exported successfully to Google Drive');
      return result;
    } catch (error) {
      console.error('Error exporting board to Google Drive:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to export board';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    files,
    folders,
    listFiles,
    searchFiles,
    uploadFile,
    downloadFile,
    deleteFile,
    createFolder,
    exportBoardToGoogleDrive,
    getWhizboardFolder,
  };
}
