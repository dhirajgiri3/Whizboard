import { getToken, upsertToken } from './tokenStore';
import logger from '@/lib/logger/logger';
import { google } from 'googleapis';
import { Readable } from 'stream';
import axios from 'axios';

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
  webViewLink?: string;
}

export interface UploadResult {
  success: boolean;
  fileId?: string;
  error?: string;
  file?: GoogleDriveFile;
}

export interface DownloadResult {
  success: boolean;
  data?: Buffer;
  error?: string;
  fileName?: string;
  mimeType?: string;
}

class GoogleDriveService {
  private async refreshTokenIfNeeded(userEmail: string): Promise<string | null> {
    logger.info({ userEmail }, 'Checking if Google Drive token needs refresh');
    
    try {
      const token = await getToken(userEmail, 'googleDrive');
      if (!token?.accessToken) {
        logger.warn({ userEmail }, 'No Google Drive token found for user');
        return null;
      }

      logger.debug({ userEmail, hasRefreshToken: !!token.refreshToken, expiresAt: token.expiresAt }, 'Token details');

      // Check if token is expired or will expire soon (within 5 minutes)
      if (token.expiresAt && new Date() > new Date(token.expiresAt.getTime() - 5 * 60 * 1000)) {
        logger.info({ userEmail, expiresAt: token.expiresAt }, 'Token expired or expiring soon, attempting refresh');
        
        if (!token.refreshToken) {
          logger.warn({ userEmail }, 'Token expired and no refresh token available');
          return null;
        }

        logger.debug({ userEmail }, 'Initiating token refresh request');
        const refreshResponse = await axios.post('https://oauth2.googleapis.com/token', new URLSearchParams({
          client_id: process.env.GOOGLE_DRIVE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '',
          client_secret: process.env.GOOGLE_DRIVE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || '',
          refresh_token: token.refreshToken!,
          grant_type: 'refresh_token',
        }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, withCredentials: false });

        const refreshData = refreshResponse.data as any;
        const newExpiresAt = refreshData.expires_in 
          ? new Date(Date.now() + refreshData.expires_in * 1000)
          : null;

        logger.info({ userEmail, newExpiresAt, hasNewAccessToken: !!refreshData.access_token }, 'Token refresh successful');

        await upsertToken({
          userEmail,
          provider: 'googleDrive',
          accessToken: refreshData.access_token,
          refreshToken: token.refreshToken, // Keep the same refresh token
          expiresAt: newExpiresAt,
          scope: token.scope,
        });

        return refreshData.access_token;
      }

      logger.debug({ userEmail }, 'Token is still valid, no refresh needed');
      return token.accessToken;
    } catch (error) {
      logger.error({ userEmail, error }, 'Error refreshing Google Drive token');
      return null;
    }
  }

  private async makeGoogleDriveRequest(
    userEmail: string,
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    logger.info({ userEmail, endpoint, method: options.method || 'GET' }, 'Making Google Drive API request');
    
    const accessToken = await this.refreshTokenIfNeeded(userEmail);
    if (!accessToken) {
      logger.error({ userEmail, endpoint }, 'No valid access token available for Google Drive request');
      throw new Error('No valid access token available');
    }

    logger.debug({ userEmail, endpoint, hasAccessToken: !!accessToken }, 'Proceeding with Google Drive API request');

    const axiosResponse = await axios.request({
      url: `https://www.googleapis.com/drive/v3/${endpoint}`,
      method: (options.method as any) || 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...(options.headers as any),
      },
      data: (options as any).body,
      responseType: 'json',
      withCredentials: false,
      validateStatus: () => true,
    });

    logger.debug({ userEmail, endpoint, status: axiosResponse.status }, 'Google Drive API response received');

    if (axiosResponse.status < 200 || axiosResponse.status >= 300) {
      const errorData = axiosResponse.data || {};
      logger.error({ 
        userEmail, 
        endpoint, 
        status: axiosResponse.status, 
        statusText: axiosResponse.statusText,
        error: errorData 
      }, 'Google Drive API request failed');
      throw new Error(`Google Drive API error: ${axiosResponse.status} ${axiosResponse.statusText}`);
    }

    logger.info({ userEmail, endpoint, status: axiosResponse.status }, 'Google Drive API request successful');
    // Create a Response-like object from axios data for current call sites
    const blob = new Blob([JSON.stringify(axiosResponse.data)], { type: 'application/json' });
    return new Response(blob, { status: axiosResponse.status, headers: { 'Content-Type': 'application/json' } });
  }

  async listFiles(userEmail: string, folderId?: string): Promise<GoogleDriveFile[]> {
    logger.info({ userEmail, folderId }, 'Listing Google Drive files');
    
    try {
      let query = "trashed=false";
      if (folderId) {
        query += ` and '${folderId}' in parents`;
      }

      logger.debug({ userEmail, folderId, query }, 'Google Drive list files query');

      const response = await this.makeGoogleDriveRequest(
        userEmail,
        `files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,size,createdTime,modifiedTime,parents,webViewLink,thumbnailLink)&orderBy=modifiedTime desc`
      );

      const data = await response.json();
      const files = data.files || [];
      
      logger.info({ userEmail, folderId, fileCount: files.length }, 'Successfully listed Google Drive files');
      logger.debug({ userEmail, files: files.map((f: any) => ({ id: f.id, name: f.name, mimeType: f.mimeType })) }, 'File details');
      
      return files;
    } catch (error) {
      logger.error({ userEmail, folderId, error }, 'Failed to list Google Drive files');
      throw error;
    }
  }

  async createFolder(userEmail: string, name: string, parentFolderId?: string): Promise<GoogleDriveFolder | null> {
    try {
      const folderMetadata = {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        ...(parentFolderId && { parents: [parentFolderId] }),
      };

      const response = await this.makeGoogleDriveRequest(
        userEmail,
        'files',
        {
          method: 'POST',
          body: JSON.stringify(folderMetadata),
        }
      );

      const folder = await response.json();
      return folder;
    } catch (error) {
      logger.error({ userEmail, name, error }, 'Failed to create Google Drive folder');
      throw error;
    }
  }

  async getOrCreateWhizboardFolder(userEmail: string): Promise<GoogleDriveFolder | null> {
    logger.info({ userEmail }, 'Getting or creating Whizboard folder');
    
    try {
      // First, try to find existing Whizboard folder
      const searchQuery = "name='Whizboard' and mimeType='application/vnd.google-apps.folder' and trashed=false";
      const response = await this.makeGoogleDriveRequest(
        userEmail,
        `files?q=${encodeURIComponent(searchQuery)}&fields=files(id,name,mimeType,createdTime,modifiedTime,parents,webViewLink)`
      );

      const data = await response.json();
      const existingFolders = data.files || [];

      if (existingFolders.length > 0) {
        // Use the first (most recent) Whizboard folder
        const folder = existingFolders[0];
        logger.info({ userEmail, folderId: folder.id }, 'Found existing Whizboard folder');
        return {
          id: folder.id,
          name: folder.name,
          mimeType: folder.mimeType,
          createdTime: folder.createdTime,
          modifiedTime: folder.modifiedTime,
          parents: folder.parents,
          webViewLink: folder.webViewLink,
        };
      }

      // Create new Whizboard folder if none exists
      logger.info({ userEmail }, 'Creating new Whizboard folder');
      const newFolder = await this.createFolder(userEmail, 'Whizboard');
      
      if (newFolder) {
        logger.info({ userEmail, folderId: newFolder.id }, 'Successfully created Whizboard folder');
      }
      
      return newFolder;
    } catch (error) {
      logger.error({ userEmail, error }, 'Failed to get or create Whizboard folder');
      return null;
    }
  }

  async uploadFile(
    userEmail: string,
    fileName: string,
    fileData: string | Buffer,
    mimeType: string = 'application/json',
    parentFolderId?: string
  ): Promise<UploadResult> {
    logger.info({ userEmail, fileName, mimeType, parentFolderId, dataSize: typeof fileData === 'string' ? fileData.length : fileData.byteLength }, 'Uploading file to Google Drive');
    
    try {
      // Prefer official googleapis client to avoid multipart edge cases
      const token = await getToken(userEmail, 'googleDrive');
      if (!token?.accessToken || !token?.refreshToken) {
        logger.error({ userEmail, hasAccessToken: !!token?.accessToken, hasRefreshToken: !!token?.refreshToken }, 'Missing tokens for Google API client');
        return { success: false, error: 'Missing Google Drive tokens' };
      }

      const oauth2 = new google.auth.OAuth2(
        process.env.GOOGLE_DRIVE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '',
        process.env.GOOGLE_DRIVE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || ''
      );
      oauth2.setCredentials({
        access_token: token.accessToken,
        refresh_token: token.refreshToken,
      });

      const drive = google.drive({ version: 'v3', auth: oauth2 });

      // Create a proper stream for the file data
      let bodyStream: Readable;
      if (fileData instanceof Buffer) {
        bodyStream = Readable.from(fileData);
      } else {
        // Handle possible data URL or base64 payloads safely; otherwise treat as UTF-8 text
        const stringData = fileData as string;
        const dataUrlMatch = /^data:[^;]+;base64,(.*)$/i.exec(stringData);
        if (dataUrlMatch) {
          bodyStream = Readable.from(Buffer.from(dataUrlMatch[1], 'base64'));
        } else if (
          // Heuristically detect base64 (no spaces, valid base64 charset, length % 4 == 0)
          !/json|svg|text\//i.test(mimeType) &&
          /^[A-Za-z0-9+/=\s]+$/.test(stringData) &&
          stringData.replace(/\s+/g, '').length % 4 === 0
        ) {
          bodyStream = Readable.from(Buffer.from(stringData.replace(/\s+/g, ''), 'base64'));
        } else {
          bodyStream = Readable.from(Buffer.from(stringData, 'utf8'));
        }
      }

      const createRes = await drive.files.create({
        requestBody: {
          name: fileName,
          mimeType,
          ...(parentFolderId ? { parents: [parentFolderId] } : {}),
        },
        media: {
          mimeType,
          body: bodyStream,
        },
        fields: 'id,name,mimeType,size,createdTime,modifiedTime,parents,webViewLink',
        supportsAllDrives: true,
      });

      const file = createRes.data as any;
      
      logger.info({ userEmail, fileName, fileId: file.id, fileSize: file.size }, 'Successfully uploaded file to Google Drive');
      logger.debug({ userEmail, fileName, file }, 'Upload response details');
      
      return {
        success: true,
        fileId: file.id,
        file: {
          id: file.id as string,
          name: file.name as string,
          mimeType: file.mimeType as string,
          size: file.size as string | undefined,
          createdTime: file.createdTime as string,
          modifiedTime: file.modifiedTime as string,
          parents: (file.parents || undefined) as string[] | undefined,
          webViewLink: (file.webViewLink || undefined) as string | undefined,
        },
      };
    } catch (error) {
      logger.error({ userEmail, fileName, error }, 'Error uploading file to Google Drive');
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async downloadFile(userEmail: string, fileId: string): Promise<DownloadResult> {
    try {
      // First get file metadata
      const metadataResponse = await this.makeGoogleDriveRequest(
        userEmail,
        `files/${fileId}?fields=name,mimeType`
      );
      const metadata = await metadataResponse.json();

      // Then download the file content
      const accessToken = await this.refreshTokenIfNeeded(userEmail);
      if (!accessToken) {
        return { success: false, error: 'No valid access token available' };
      }

      const downloadResponse = await axios.get(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
        responseType: 'arraybuffer',
        withCredentials: false,
        validateStatus: () => true,
      });

      if (downloadResponse.status < 200 || downloadResponse.status >= 300) {
        return { success: false, error: `Download failed: ${downloadResponse.status} ${downloadResponse.statusText}` };
      }

      // Read as binary to avoid data corruption
      const arrayBuffer = downloadResponse.data as ArrayBuffer;
      const data = Buffer.from(arrayBuffer);
      return {
        success: true,
        data,
        fileName: metadata.name,
        mimeType: metadata.mimeType,
      };
    } catch (error) {
      logger.error({ userEmail, fileId, error }, 'Error downloading file from Google Drive');
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async deleteFile(userEmail: string, fileId: string): Promise<boolean> {
    try {
      await this.makeGoogleDriveRequest(userEmail, `files/${fileId}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      logger.error({ userEmail, fileId, error }, 'Failed to delete Google Drive file');
      return false;
    }
  }

  async getFileInfo(userEmail: string, fileId: string): Promise<GoogleDriveFile | null> {
    try {
      const response = await this.makeGoogleDriveRequest(
        userEmail,
        `files/${fileId}?fields=id,name,mimeType,size,createdTime,modifiedTime,parents,webViewLink,thumbnailLink`
      );
      return await response.json();
    } catch (error) {
      logger.error({ userEmail, fileId, error }, 'Failed to get Google Drive file info');
      return null;
    }
  }

  async searchFiles(userEmail: string, query: string): Promise<GoogleDriveFile[]> {
    try {
      const searchQuery = `name contains '${query}' and trashed=false`;
      const response = await this.makeGoogleDriveRequest(
        userEmail,
        `files?q=${encodeURIComponent(searchQuery)}&fields=files(id,name,mimeType,size,createdTime,modifiedTime,parents,webViewLink,thumbnailLink)&orderBy=modifiedTime desc`
      );
      const data = await response.json();
      return data.files || [];
    } catch (error) {
      logger.error({ userEmail, query, error }, 'Failed to search Google Drive files');
      throw error;
    }
  }
}

export const googleDriveService = new GoogleDriveService();
