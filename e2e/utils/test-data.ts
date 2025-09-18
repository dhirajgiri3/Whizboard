/**
 * Test data utilities for end-to-end tests
 */

import { nanoid } from 'nanoid';

/**
 * Generate a unique test email
 * @returns A unique test email
 */
export function generateTestEmail(): string {
  return `test-${nanoid(8)}@example.com`;
}

/**
 * Generate a unique test username
 * @returns A unique test username
 */
export function generateTestUsername(): string {
  return `test-user-${nanoid(8)}`;
}

/**
 * Generate a unique test board name
 * @returns A unique test board name
 */
export function generateTestBoardName(): string {
  return `Test Board ${nanoid(8)}`;
}

/**
 * Generate test user data
 * @returns Test user data
 */
export function generateTestUser() {
  return {
    name: generateTestUsername(),
    email: generateTestEmail(),
    password: `Password123!${nanoid(4)}`,
  };
}

/**
 * Generate a random color
 * @returns A random hex color
 */
export function generateRandomColor(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
}

/**
 * Generate random text
 * @param length Length of the text
 * @returns Random text
 */
export function generateRandomText(length: number = 10): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Generate random points for a line
 * @param count Number of points
 * @param startX Starting X coordinate
 * @param startY Starting Y coordinate
 * @param maxDistance Maximum distance between points
 * @returns Array of points
 */
export function generateRandomPoints(
  count: number = 5,
  startX: number = 300,
  startY: number = 300,
  maxDistance: number = 50
): { x: number, y: number }[] {
  const points: { x: number, y: number }[] = [{ x: startX, y: startY }];
  
  for (let i = 1; i < count; i++) {
    const lastPoint = points[i - 1];
    const dx = (Math.random() * 2 - 1) * maxDistance;
    const dy = (Math.random() * 2 - 1) * maxDistance;
    
    points.push({
      x: lastPoint.x + dx,
      y: lastPoint.y + dy,
    });
  }
  
  return points;
}
