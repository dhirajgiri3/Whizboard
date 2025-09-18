/**
 * Client-side image compression utility
 * Reduces payload size for image uploads
 */

interface CompressionOptions {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean;
  quality: number;
  fileType?: string;
}

interface CompressionResult {
  compressedFile: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

/**
 * Default compression options optimized for canvas images
 */
const defaultOptions: CompressionOptions = {
  maxSizeMB: 2, // Target max size of 2MB
  maxWidthOrHeight: 1920, // Max dimension to maintain reasonable quality
  useWebWorker: true, // Use web worker for non-blocking compression
  quality: 0.8, // 80% quality for good balance of size vs quality
  fileType: 'image/jpeg' // JPEG for photos, can be overridden for PNGs
};

/**
 * Compress an image file on the client side
 */
export async function compressImage(
  file: File,
  options: Partial<CompressionOptions> = {}
): Promise<CompressionResult> {
  const opts = { ...defaultOptions, ...options };

  // Only compress images
  if (!file.type.startsWith('image/')) {
    throw new Error('File is not an image');
  }

  const originalSize = file.size;

  try {
    // For small files, don't compress to avoid unnecessary processing
    if (originalSize < 100 * 1024) { // Less than 100KB
      return {
        compressedFile: file,
        originalSize,
        compressedSize: originalSize,
        compressionRatio: 1
      };
    }

    // Use a lightweight compression approach to avoid external dependencies
    const compressedFile = await compressImageWithCanvas(file, opts);

    const compressedSize = compressedFile.size;
    const compressionRatio = originalSize / compressedSize;

    console.log(`Image compressed: ${formatBytes(originalSize)} → ${formatBytes(compressedSize)} (${(compressionRatio * 100 - 100).toFixed(1)}% reduction)`);

    return {
      compressedFile,
      originalSize,
      compressedSize,
      compressionRatio
    };
  } catch (error) {
    console.error('Image compression failed:', error);
    // Return original file if compression fails
    return {
      compressedFile: file,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 1
    };
  }
}

/**
 * Compress image using HTML5 Canvas API (no external dependencies)
 */
async function compressImageWithCanvas(
  file: File,
  options: CompressionOptions
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      try {
        // Calculate new dimensions
        const { width, height } = calculateNewDimensions(
          img.width,
          img.height,
          options.maxWidthOrHeight
        );

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        // Determine output format
        const outputType = options.fileType || file.type;
        const quality = outputType === 'image/jpeg' ? options.quality : undefined;

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas to blob conversion failed'));
              return;
            }

            // Create new File object
            const compressedFile = new File([blob], file.name, {
              type: outputType,
              lastModified: Date.now()
            });

            resolve(compressedFile);
          },
          outputType,
          quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Image load failed'));
    };

    // Load image
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Calculate new dimensions while maintaining aspect ratio
 */
function calculateNewDimensions(
  originalWidth: number,
  originalHeight: number,
  maxDimension: number
): { width: number; height: number } {
  if (originalWidth <= maxDimension && originalHeight <= maxDimension) {
    return { width: originalWidth, height: originalHeight };
  }

  const aspectRatio = originalWidth / originalHeight;

  if (originalWidth > originalHeight) {
    return {
      width: maxDimension,
      height: Math.round(maxDimension / aspectRatio)
    };
  } else {
    return {
      width: Math.round(maxDimension * aspectRatio),
      height: maxDimension
    };
  }
}

/**
 * Format bytes for display
 */
function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Validate if file needs compression
 */
export function shouldCompressImage(file: File, maxSizeMB: number = 2): boolean {
  if (!file.type.startsWith('image/')) {
    return false;
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size > maxSizeBytes;
}

/**
 * Get compression recommendations based on file type and size
 */
export function getCompressionRecommendations(file: File): Partial<CompressionOptions> {
  if (!file.type.startsWith('image/')) {
    return {};
  }

  const sizeMB = file.size / (1024 * 1024);

  // For very large images
  if (sizeMB > 5) {
    return {
      maxSizeMB: 1,
      maxWidthOrHeight: 1280,
      quality: 0.7
    };
  }

  // For PNG images (preserve transparency if possible)
  if (file.type === 'image/png') {
    return {
      maxSizeMB: 3,
      maxWidthOrHeight: 1920,
      quality: 0.9,
      fileType: 'image/png' // Keep as PNG
    };
  }

  // For JPEG images
  if (file.type === 'image/jpeg') {
    return {
      maxSizeMB: 2,
      maxWidthOrHeight: 1920,
      quality: 0.8,
      fileType: 'image/jpeg'
    };
  }

  // Default for other image types
  return {
    maxSizeMB: 2,
    maxWidthOrHeight: 1920,
    quality: 0.8,
    fileType: 'image/jpeg' // Convert to JPEG for smaller size
  };
}

/**
 * Batch compress multiple images
 */
export async function compressMultipleImages(
  files: File[],
  options: Partial<CompressionOptions> = {}
): Promise<CompressionResult[]> {
  const results: CompressionResult[] = [];

  for (const file of files) {
    try {
      const result = await compressImage(file, options);
      results.push(result);
    } catch (error) {
      console.error(`Failed to compress ${file.name}:`, error);
      // Add uncompressed file to results
      results.push({
        compressedFile: file,
        originalSize: file.size,
        compressedSize: file.size,
        compressionRatio: 1
      });
    }
  }

  return results;
}