/**
 * End-to-end tests for board creation
 */

import { test, expect } from '@playwright/test';
import { loginViaUI } from '../utils/auth';
import { createBoard, deleteBoard } from '../utils/board';
import { generateTestBoardName } from '../utils/test-data';

test.describe('Board Creation', () => {
  // Test user data
  const testUser = {
    email: process.env.TEST_USER_EMAIL || 'test@example.com',
    password: process.env.TEST_USER_PASSWORD || 'Password123!',
  };
  
  // Test board data
  const boardName = generateTestBoardName();
  let boardId: string;
  
  // Login before each test
  test.beforeEach(async ({ page }) => {
    await loginViaUI(page, testUser.email, testUser.password);
  });
  
  // Clean up after tests
  test.afterAll(async ({ page }) => {
    if (boardId) {
      await loginViaUI(page, testUser.email, testUser.password);
      await deleteBoard(page, boardId);
    }
  });
  
  test('should display my boards page', async ({ page }) => {
    // Navigate to my boards page
    await page.goto('/my-boards');
    
    // Check that page title is displayed
    await expect(page.getByRole('heading', { name: 'My Boards' })).toBeVisible();
    
    // Check that create board button is displayed
    await expect(page.getByRole('button', { name: 'Create New Board' })).toBeVisible();
  });
  
  test('should create a new board', async ({ page }) => {
    // Navigate to my boards page
    await page.goto('/my-boards');
    
    // Click on create board button
    await page.click('text=Create New Board');
    
    // Check that modal is displayed
    await expect(page.getByRole('heading', { name: 'Create New Board' })).toBeVisible();
    
    // Fill in board name
    await page.fill('input[name="boardName"]', boardName);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for navigation to complete
    await page.waitForURL('**/board/**');
    
    // Extract board ID from URL
    const url = page.url();
    boardId = url.split('/board/')[1];
    
    // Check that board is created
    await expect(page.getByText(boardName)).toBeVisible();
    
    // Check that toolbar is displayed
    await expect(page.getByRole('toolbar')).toBeVisible();
  });
  
  test('should display the created board in my boards list', async ({ page }) => {
    // Navigate to my boards page
    await page.goto('/my-boards');
    
    // Check that the created board is displayed
    await expect(page.getByText(boardName)).toBeVisible();
  });
  
  test('should open the board from my boards list', async ({ page }) => {
    // Navigate to my boards page
    await page.goto('/my-boards');
    
    // Click on the board
    await page.click(`text=${boardName}`);
    
    // Wait for navigation to complete
    await page.waitForURL(`**/board/${boardId}`);
    
    // Check that board is displayed
    await expect(page.getByText(boardName)).toBeVisible();
    
    // Check that toolbar is displayed
    await expect(page.getByRole('toolbar')).toBeVisible();
  });
});
