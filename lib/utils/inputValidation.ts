import { z } from 'zod';

// File validation schemas
export const FileValidationSchema = z.object({
  name: z.string().min(1).max(255),
  size: z.number().min(1).max(50 * 1024 * 1024), // 50MB max
  type: z.string().refine((type) => {
    const allowedTypes = [
      'application/json',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/zip',
      'application/x-zip-compressed'
    ];
    return allowedTypes.includes(type);
  }, 'File type not allowed'),
});

export const ImageFileSchema = z.object({
  name: z.string().min(1).max(255),
  size: z.number().min(1).max(10 * 1024 * 1024), // 10MB max for images
  type: z.string().refine((type) => {
    const allowedImageTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ];
    return allowedImageTypes.includes(type);
  }, 'Image type not allowed'),
});

// Board validation schemas
export const BoardValidationSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(false),
  collaborators: z.array(z.object({
    id: z.string().min(1),
    email: z.string().email(),
    name: z.string().min(1).max(100)
  })).optional(),
});

// Element validation schemas
export const ElementValidationSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['line', 'shape', 'frame', 'text', 'image']),
  data: z.record(z.any()),
  style: z.record(z.any()).optional(),
  createdBy: z.string().min(1),
  createdAt: z.number(),
  updatedAt: z.number(),
  version: z.number().min(1),
});

// User input validation schemas
export const UserInputSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  email: z.string().email(),
  avatar: z.string().url().optional(),
});

// Invitation validation schema
export const InvitationSchema = z.object({
  boardId: z.string().min(1),
  inviteeEmail: z.string().email(),
  message: z.string().max(500).optional(),
});

// Real-time event validation schemas
export const CursorEventSchema = z.object({
  boardId: z.string().min(1),
  userId: z.string().min(1),
  name: z.string().min(1).max(100),
  x: z.number().finite(),
  y: z.number().finite(),
});

export const DrawingEventSchema = z.object({
  boardId: z.string().min(1),
  userId: z.string().min(1),
  userName: z.string().min(1).max(100),
  line: z.object({
    id: z.string().min(1),
    points: z.array(z.number().finite()),
    tool: z.string().min(1),
    color: z.string().min(1),
    strokeWidth: z.number().min(0.1).max(50),
  }),
  action: z.enum(['start', 'update', 'complete']),
});

// Input sanitization functions
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length
}

export function sanitizeHTML(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/data:/gi, '') // Remove data protocol
    .replace(/vbscript:/gi, '') // Remove vbscript protocol
    .trim();
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

// Validation helper functions
export function validateFile(file: File, schema: z.ZodSchema): { success: boolean; error?: string } {
  try {
    const fileData = {
      name: file.name,
      size: file.size,
      type: file.type,
    };
    
    schema.parse(fileData);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'File validation failed' };
  }
}

export function validateInput<T>(data: T, schema: z.ZodSchema): { success: boolean; data?: T; error?: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Input validation failed' };
  }
}

// Rate limiting validation
export function validateRateLimit(current: number, limit: number): { allowed: boolean; remaining: number } {
  const remaining = Math.max(0, limit - current);
  return {
    allowed: current < limit,
    remaining
  };
}

// SQL injection prevention (for MongoDB queries)
export function sanitizeMongoQuery(query: any): any {
  if (typeof query === 'string') {
    // Remove potential MongoDB operators
    return query.replace(/\$[a-zA-Z]+/g, '');
  }
  
  if (typeof query === 'object' && query !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(query)) {
      if (key.startsWith('$')) {
        // Skip MongoDB operators in keys
        continue;
      }
      sanitized[key] = sanitizeMongoQuery(value);
    }
    return sanitized;
  }
  
  return query;
}

// XSS prevention
export function escapeHTML(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Path traversal prevention
export function sanitizePath(path: string): string {
  return path
    .replace(/\.\./g, '') // Remove directory traversal
    .replace(/\/\//g, '/') // Normalize slashes
    .replace(/^\/+/, '') // Remove leading slashes
    .replace(/\/+$/, ''); // Remove trailing slashes
}
