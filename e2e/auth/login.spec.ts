/**
 * End-to-end tests for authentication
 */

import { test, expect } from '@playwright/test';
import { loginViaUI, logout } from '../utils/auth';
import { generateTestUser } from '../utils/test-data';

test.describe('Authentication', () => {
  // Test user data
  const testUser = {
    email: process.env.TEST_USER_EMAIL || 'test@example.com',
    password: process.env.TEST_USER_PASSWORD || 'Password123!',
  };
  
  test('should display login page', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Check that login form is displayed
    await expect(page.getByRole('heading', { name: 'Login to Whizboard' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });
  
  test('should show error for invalid credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Fill in login form with invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Check for error message
    await expect(page.getByText('Invalid email or password')).toBeVisible();
  });
  
  test('should login successfully with valid credentials', async ({ page }) => {
    // Login using the UI
    await loginViaUI(page, testUser.email, testUser.password);
    
    // Check that we're redirected to my boards page
    await expect(page).toHaveURL(/.*\/my-boards/);
    
    // Check that user menu is visible
    await expect(page.getByRole('button', { name: 'User menu' })).toBeVisible();
  });
  
  test('should logout successfully', async ({ page }) => {
    // Login first
    await loginViaUI(page, testUser.email, testUser.password);
    
    // Logout
    await logout(page);
    
    // Check that we're redirected to home page
    await expect(page).toHaveURL(/.*\//);
    
    // Check that login link is visible
    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
  });
  
  test('should redirect to login page for protected routes', async ({ page }) => {
    // Try to access a protected route without logging in
    await page.goto('/my-boards');
    
    // Check that we're redirected to login page
    await expect(page).toHaveURL(/.*\/login/);
  });
});
