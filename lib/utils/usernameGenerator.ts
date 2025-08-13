import { connectToDatabase } from '@/lib/database/mongodb';

/**
 * Generates a unique username from email and name
 * @param email - User's email address
 * @param name - User's display name
 * @returns A unique username
 */
export async function generateUniqueUsername(email: string, name?: string): Promise<string> {
  const db = await connectToDatabase();
  
  // Extract base username from email (before @)
  const emailBase = email.split('@')[0];
  
  // Clean the email base (remove special characters, keep alphanumeric and dots)
  let baseUsername = emailBase.replace(/[^a-zA-Z0-9.]/g, '').toLowerCase();
  
  // If name is provided, try to use it as base
  if (name) {
    const nameBase = name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 20); // Limit to 20 characters
    
    if (nameBase.length >= 3) {
      baseUsername = nameBase;
    }
  }
  
  // Ensure base username is at least 3 characters
  if (baseUsername.length < 3) {
    baseUsername = emailBase.substring(0, 3) + Math.random().toString(36).substring(2, 5);
  }
  
  // Check if username exists
  let username = baseUsername;
  let counter = 1;
  
  while (true) {
    const existingUser = await db.collection('users').findOne({ username });
    
    if (!existingUser) {
      break; // Username is available
    }
    
    // Try with counter suffix
    username = `${baseUsername}${counter}`;
    counter++;
    
    // Prevent infinite loop (max 100 attempts)
    if (counter > 100) {
      // Fallback to timestamp-based username
      username = `${baseUsername}${Date.now().toString(36)}`;
      break;
    }
  }
  
  return username;
}

/**
 * Validates if a username is available
 * @param username - Username to check
 * @returns true if available, false if taken
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const db = await connectToDatabase();
  const existingUser = await db.collection('users').findOne({ username });
  return !existingUser;
}

/**
 * Validates username format
 * @param username - Username to validate
 * @returns Validation result with error message if invalid
 */
export function validateUsername(username: string): { isValid: boolean; error?: string } {
  if (!username) {
    return { isValid: false, error: 'Username is required' };
  }
  
  if (username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters long' };
  }
  
  if (username.length > 30) {
    return { isValid: false, error: 'Username must be less than 30 characters' };
  }
  
  // Only allow alphanumeric characters, dots, and underscores
  if (!/^[a-zA-Z0-9._]+$/.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, dots, and underscores' };
  }
  
  // Cannot start with dot or underscore
  if (/^[._]/.test(username)) {
    return { isValid: false, error: 'Username cannot start with a dot or underscore' };
  }
  
  // Cannot end with dot or underscore
  if (/[._]$/.test(username)) {
    return { isValid: false, error: 'Username cannot end with a dot or underscore' };
  }
  
  // Cannot have consecutive dots or underscores
  if (/[._]{2,}/.test(username)) {
    return { isValid: false, error: 'Username cannot have consecutive dots or underscores' };
  }
  
  return { isValid: true };
}

