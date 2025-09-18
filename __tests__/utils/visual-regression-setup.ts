/**
 * Visual Regression Testing Setup
 * 
 * This module provides utilities for visual regression testing
 * of UI components using jest-image-snapshot and Playwright.
 */

import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { afterAll, beforeAll, expect, vi } from 'vitest';
import path from 'path';
import fs from 'fs';

// Add the toMatchImageSnapshot matcher to expect
expect.extend({ toMatchImageSnapshot });

// Configuration for image snapshots
const imageSnapshotConfig = {
  // Threshold for the difference between images (0-1)
  // Lower values are more strict
  failureThreshold: 0.01,
  failureThresholdType: 'percent',
  // Add a border to highlight differences
  customDiffConfig: {
    threshold: 0.1,
  },
  // Store snapshots in a dedicated directory
  customSnapshotsDir: path.join(process.cwd(), '__image_snapshots__'),
  // Add component name to snapshot name
  customSnapshotIdentifier: ({ currentTestName, counter }: { currentTestName: string, counter: number }) => {
    // Clean up test name to create a valid filename
    const testName = currentTestName
      .replace(/[^a-z0-9]/gi, '-')
      .toLowerCase();
    return `${testName}-${counter}`;
  },
};

// Browser and page variables for tests
let browser: Browser;
let context: BrowserContext;
let page: Page;

// Setup browser for tests
export const setupVisualRegressionTesting = () => {
  // Set up browser before all tests
  beforeAll(async () => {
    // Create browser instance
    browser = await chromium.launch({
      headless: true, // Run in headless mode
    });
    
    // Create browser context
    context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      deviceScaleFactor: 1,
      colorScheme: 'light',
    });
    
    // Create page
    page = await context.newPage();
    
    // Create snapshots directory if it doesn't exist
    const snapshotsDir = imageSnapshotConfig.customSnapshotsDir;
    if (!fs.existsSync(snapshotsDir)) {
      fs.mkdirSync(snapshotsDir, { recursive: true });
    }
  });
  
  // Clean up browser after all tests
  afterAll(async () => {
    await context.close();
    await browser.close();
  });
  
  return {
    // Get the browser page
    getPage: () => page,
    
    // Get the browser context
    getContext: () => context,
    
    // Get the browser
    getBrowser: () => browser,
    
    // Take a screenshot of an element and compare it to a snapshot
    async takeElementScreenshot(selector: string, options: {
      name?: string;
      updateSnapshot?: boolean;
      failureThreshold?: number;
    } = {}) {
      // Find the element
      const element = await page.$(selector);
      if (!element) {
        throw new Error(`Element not found: ${selector}`);
      }
      
      // Take a screenshot of the element
      const screenshot = await element.screenshot();
      
      // Compare to snapshot
      expect(screenshot).toMatchImageSnapshot({
        ...imageSnapshotConfig,
        customSnapshotIdentifier: options.name || selector.replace(/[^a-z0-9]/gi, '-'),
        updateSnapshot: options.updateSnapshot,
        failureThreshold: options.failureThreshold || imageSnapshotConfig.failureThreshold,
      });
      
      return screenshot;
    },
    
    // Take a screenshot of the page and compare it to a snapshot
    async takePageScreenshot(options: {
      name?: string;
      updateSnapshot?: boolean;
      failureThreshold?: number;
    } = {}) {
      // Take a screenshot of the page
      const screenshot = await page.screenshot();
      
      // Compare to snapshot
      expect(screenshot).toMatchImageSnapshot({
        ...imageSnapshotConfig,
        customSnapshotIdentifier: options.name || 'page',
        updateSnapshot: options.updateSnapshot,
        failureThreshold: options.failureThreshold || imageSnapshotConfig.failureThreshold,
      });
      
      return screenshot;
    },
    
    // Render a component to the page for testing
    async renderComponent(component: React.ReactElement, options: {
      width?: number;
      height?: number;
      colorScheme?: 'light' | 'dark';
    } = {}) {
      // Set viewport size
      if (options.width && options.height) {
        await page.setViewportSize({
          width: options.width,
          height: options.height,
        });
      }
      
      // Set color scheme
      if (options.colorScheme) {
        await context.setColorScheme(options.colorScheme);
      }
      
      // Convert component to HTML
      const { renderToString } = await import('react-dom/server');
      const html = renderToString(component);
      
      // Create a basic HTML page with the component
      const fullHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Visual Regression Test</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
                  Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              }
              #root {
                padding: 16px;
              }
            </style>
          </head>
          <body>
            <div id="root">${html}</div>
          </body>
        </html>
      `;
      
      // Load the HTML
      await page.setContent(fullHtml);
      
      // Wait for any images to load
      await page.waitForLoadState('networkidle');
      
      return page;
    },
    
    // Render a component with different themes for testing
    async renderComponentWithThemes(component: React.ReactElement, options: {
      width?: number;
      height?: number;
      themes?: ('light' | 'dark')[];
      name?: string;
      updateSnapshot?: boolean;
    } = {}) {
      const themes = options.themes || ['light', 'dark'];
      const results: Buffer[] = [];
      
      for (const theme of themes) {
        // Render the component with the theme
        await this.renderComponent(component, {
          width: options.width,
          height: options.height,
          colorScheme: theme,
        });
        
        // Take a screenshot
        const screenshot = await page.screenshot();
        
        // Compare to snapshot
        expect(screenshot).toMatchImageSnapshot({
          ...imageSnapshotConfig,
          customSnapshotIdentifier: `${options.name || 'component'}-${theme}`,
          updateSnapshot: options.updateSnapshot,
        });
        
        results.push(screenshot);
      }
      
      return results;
    },
  };
};

// Export the image snapshot config
export { imageSnapshotConfig };
