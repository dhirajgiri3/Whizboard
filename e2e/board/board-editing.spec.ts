/**
 * End-to-end tests for board editing
 */

import { test, expect } from '@playwright/test';
import { loginViaUI } from '../utils/auth';
import { 
  createBoard, 
  deleteBoard, 
  addStickyNote, 
  addTextElement, 
  addShape 
} from '../utils/board';
import { generateTestBoardName, generateRandomText } from '../utils/test-data';

test.describe('Board Editing', () => {
  // Test user data
  const testUser = {
    email: process.env.TEST_USER_EMAIL || 'test@example.com',
    password: process.env.TEST_USER_PASSWORD || 'Password123!',
  };
  
  // Test board data
  const boardName = generateTestBoardName();
  let boardId: string;
  
  // Login and create a board before tests
  test.beforeAll(async ({ page }) => {
    await loginViaUI(page, testUser.email, testUser.password);
    boardId = await createBoard(page, boardName);
  });
  
  // Login before each test
  test.beforeEach(async ({ page }) => {
    await loginViaUI(page, testUser.email, testUser.password);
    await page.goto(`/board/${boardId}`);
  });
  
  // Clean up after tests
  test.afterAll(async ({ page }) => {
    await loginViaUI(page, testUser.email, testUser.password);
    await deleteBoard(page, boardId);
  });
  
  test('should display the board toolbar', async ({ page }) => {
    // Check that toolbar is displayed
    await expect(page.getByRole('toolbar')).toBeVisible();
    
    // Check that common tools are displayed
    await expect(page.getByRole('button', { name: 'Select' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Sticky Note' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Text' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Shape' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Draw' })).toBeVisible();
  });
  
  test('should add a sticky note to the board', async ({ page }) => {
    // Generate random text for the sticky note
    const noteText = generateRandomText(20);
    
    // Add a sticky note
    await addStickyNote(page, noteText);
    
    // Check that the sticky note is displayed
    await expect(page.getByText(noteText)).toBeVisible();
  });
  
  test('should add a text element to the board', async ({ page }) => {
    // Generate random text
    const text = generateRandomText(20);
    
    // Add a text element
    await addTextElement(page, text);
    
    // Check that the text element is displayed
    await expect(page.getByText(text)).toBeVisible();
  });
  
  test('should add a shape to the board', async ({ page }) => {
    // Add a rectangle shape
    await addShape(page, 'rectangle');
    
    // Check that the shape is displayed
    // Note: This is a bit tricky to verify visually, so we'll check for the SVG element
    await expect(page.locator('svg rect')).toBeVisible();
  });
  
  test('should select and delete an element', async ({ page }) => {
    // Add a sticky note
    const noteText = generateRandomText(20);
    await addStickyNote(page, noteText);
    
    // Check that the sticky note is displayed
    await expect(page.getByText(noteText)).toBeVisible();
    
    // Click on select tool
    await page.click('button[aria-label="Select"]');
    
    // Click on the sticky note to select it
    await page.click(`text=${noteText}`);
    
    // Press delete key
    await page.keyboard.press('Delete');
    
    // Check that the sticky note is no longer displayed
    await expect(page.getByText(noteText)).not.toBeVisible();
  });
  
  test('should zoom in and out of the board', async ({ page }) => {
    // Get initial transform
    const initialTransform = await page.evaluate(() => {
      const canvas = document.querySelector('.konvajs-content');
      return canvas ? window.getComputedStyle(canvas).transform : '';
    });
    
    // Zoom in using buttons
    await page.click('button[aria-label="Zoom In"]');
    
    // Wait for zoom animation
    await page.waitForTimeout(500);
    
    // Get new transform
    const zoomedInTransform = await page.evaluate(() => {
      const canvas = document.querySelector('.konvajs-content');
      return canvas ? window.getComputedStyle(canvas).transform : '';
    });
    
    // Check that the transform has changed
    expect(initialTransform).not.toEqual(zoomedInTransform);
    
    // Zoom out
    await page.click('button[aria-label="Zoom Out"]');
    
    // Wait for zoom animation
    await page.waitForTimeout(500);
    
    // Get new transform
    const zoomedOutTransform = await page.evaluate(() => {
      const canvas = document.querySelector('.konvajs-content');
      return canvas ? window.getComputedStyle(canvas).transform : '';
    });
    
    // Check that the transform has changed
    expect(zoomedInTransform).not.toEqual(zoomedOutTransform);
  });
});
