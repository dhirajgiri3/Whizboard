/**
 * Authentication utilities for end-to-end tests
 */

import { Page } from '@playwright/test';

/**
 * Login a user using the UI
 * @param page Playwright page
 * @param email User email
 * @param password User password
 */
export async function loginViaUI(page: Page, email: string, password: string) {
  // Navigate to login page
  await page.goto('/login');
  
  // Fill in login form
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Wait for navigation to complete
  await page.waitForURL('**/my-boards');
}

/**
 * Login a user using the API (faster than UI)
 * @param page Playwright page
 * @param email User email
 * @param password User password
 */
export async function loginViaAPI(page: Page, email: string, password: string) {
  // Get CSRF token
  await page.goto('/login');
  const csrfToken = await page.evaluate(() => {
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    return metaTag ? metaTag.getAttribute('content') : '';
  });
  
  // Make login request
  const response = await page.request.post('/api/auth/callback/credentials', {
    data: {
      email,
      password,
      csrfToken,
      callbackUrl: '/my-boards',
      json: true,
    },
  });
  
  if (!response.ok()) {
    throw new Error(`Login failed: ${response.statusText()}`);
  }
  
  // Navigate to my boards page
  await page.goto('/my-boards');
}

/**
 * Logout the current user
 * @param page Playwright page
 */
export async function logout(page: Page) {
  // Click on user menu
  await page.click('button[aria-label="User menu"]');
  
  // Click on logout button
  await page.click('text=Logout');
  
  // Wait for navigation to complete
  await page.waitForURL('/');
}

/**
 * Create a test user account
 * @param page Playwright page
 * @param name User name
 * @param email User email
 * @param password User password
 */
export async function createTestUser(page: Page, name: string, email: string, password: string) {
  // Navigate to signup page
  await page.goto('/login?signup=true');
  
  // Fill in signup form
  await page.fill('input[name="name"]', name);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Wait for navigation to complete
  await page.waitForURL('**/my-boards');
}

/**
 * Delete the test user account
 * @param page Playwright page
 */
export async function deleteTestUser(page: Page) {
  // Navigate to settings page
  await page.goto('/settings');
  
  // Click on delete account button
  await page.click('text=Delete Account');
  
  // Confirm deletion
  await page.click('text=Yes, Delete My Account');
  
  // Wait for navigation to complete
  await page.waitForURL('/');
}
