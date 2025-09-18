/**
 * Board utilities for end-to-end tests
 */

import { Page, expect } from '@playwright/test';

/**
 * Create a new board
 * @param page Playwright page
 * @param name Board name
 * @returns The ID of the created board
 */
export async function createBoard(page: Page, name: string): Promise<string> {
  // Navigate to my boards page
  await page.goto('/my-boards');
  
  // Click on create board button
  await page.click('text=Create New Board');
  
  // Fill in board name
  await page.fill('input[name="boardName"]', name);
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Wait for navigation to complete and extract board ID from URL
  await page.waitForURL('**/board/**');
  const url = page.url();
  const boardId = url.split('/board/')[1];
  
  return boardId;
}

/**
 * Delete a board
 * @param page Playwright page
 * @param boardId Board ID
 */
export async function deleteBoard(page: Page, boardId: string) {
  // Navigate to board settings
  await page.goto(`/board/${boardId}/settings`);
  
  // Click on delete board button
  await page.click('text=Delete Board');
  
  // Confirm deletion
  await page.click('text=Yes, Delete Board');
  
  // Wait for navigation to complete
  await page.waitForURL('**/my-boards');
}

/**
 * Add a sticky note to a board
 * @param page Playwright page
 * @param text Sticky note text
 * @param position Position to place the sticky note
 */
export async function addStickyNote(
  page: Page, 
  text: string, 
  position = { x: 300, y: 300 }
) {
  // Click on sticky note tool
  await page.click('button[aria-label="Add Sticky Note"]');
  
  // Click on canvas to place the sticky note
  await page.mouse.click(position.x, position.y);
  
  // Type text in the sticky note
  await page.keyboard.type(text);
  
  // Click outside to save
  await page.mouse.click(position.x + 200, position.y);
  
  // Wait for the sticky note to be saved
  await page.waitForTimeout(500);
}

/**
 * Add a text element to a board
 * @param page Playwright page
 * @param text Text content
 * @param position Position to place the text
 */
export async function addTextElement(
  page: Page, 
  text: string, 
  position = { x: 300, y: 300 }
) {
  // Click on text tool
  await page.click('button[aria-label="Add Text"]');
  
  // Click on canvas to place the text
  await page.mouse.click(position.x, position.y);
  
  // Type text
  await page.keyboard.type(text);
  
  // Click outside to save
  await page.mouse.click(position.x + 200, position.y);
  
  // Wait for the text to be saved
  await page.waitForTimeout(500);
}

/**
 * Add a shape to a board
 * @param page Playwright page
 * @param shapeType Shape type (rectangle, circle, triangle)
 * @param position Position to place the shape
 */
export async function addShape(
  page: Page, 
  shapeType: 'rectangle' | 'circle' | 'triangle', 
  position = { x: 300, y: 300 }
) {
  // Click on shape tool
  await page.click('button[aria-label="Add Shape"]');
  
  // Select shape type
  await page.click(`button[aria-label="Add ${shapeType}"]`);
  
  // Click on canvas to place the shape
  await page.mouse.click(position.x, position.y);
  
  // Drag to create the shape
  await page.mouse.move(position.x + 100, position.y + 100);
  await page.mouse.down();
  await page.mouse.move(position.x + 200, position.y + 200);
  await page.mouse.up();
  
  // Wait for the shape to be saved
  await page.waitForTimeout(500);
}

/**
 * Draw a line on a board
 * @param page Playwright page
 * @param points Array of points for the line
 */
export async function drawLine(
  page: Page, 
  points: { x: number, y: number }[]
) {
  // Click on pen tool
  await page.click('button[aria-label="Draw"]');
  
  // Draw the line
  await page.mouse.move(points[0].x, points[0].y);
  await page.mouse.down();
  
  for (let i = 1; i < points.length; i++) {
    await page.mouse.move(points[i].x, points[i].y);
  }
  
  await page.mouse.up();
  
  // Wait for the line to be saved
  await page.waitForTimeout(500);
}

/**
 * Invite a user to a board
 * @param page Playwright page
 * @param boardId Board ID
 * @param email User email to invite
 * @param role User role (viewer, editor, admin)
 */
export async function inviteUserToBoard(
  page: Page, 
  boardId: string, 
  email: string, 
  role: 'viewer' | 'editor' | 'admin' = 'editor'
) {
  // Navigate to board
  await page.goto(`/board/${boardId}`);
  
  // Click on share button
  await page.click('button[aria-label="Share"]');
  
  // Fill in email
  await page.fill('input[type="email"]', email);
  
  // Select role
  await page.selectOption('select[name="role"]', role);
  
  // Click on invite button
  await page.click('button:has-text("Invite")');
  
  // Wait for invitation to be sent
  await expect(page.getByText('Invitation sent')).toBeVisible();
  
  // Close dialog
  await page.click('button[aria-label="Close"]');
}

/**
 * Export a board
 * @param page Playwright page
 * @param boardId Board ID
 * @param format Export format (png, pdf)
 */
export async function exportBoard(
  page: Page, 
  boardId: string, 
  format: 'png' | 'pdf' = 'png'
) {
  // Navigate to board
  await page.goto(`/board/${boardId}`);
  
  // Click on export button
  await page.click('button[aria-label="Export"]');
  
  // Select format
  await page.click(`button:has-text("${format.toUpperCase()}")`);
  
  // Wait for download to start
  const download = await page.waitForEvent('download');
  
  // Wait for download to complete
  const path = await download.path();
  
  return path;
}
