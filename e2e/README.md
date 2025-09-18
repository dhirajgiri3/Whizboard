# End-to-End Testing for Whizboard

This directory contains end-to-end tests for Whizboard using Playwright.

## Overview

The end-to-end tests verify that the application works correctly from a user's perspective by automating browser interactions and asserting on the expected behavior.

## Directory Structure

```
e2e/
├── auth/               # Authentication tests
├── board/              # Board-related tests
├── utils/              # Test utilities and helpers
└── README.md           # This file
```

## Running Tests

You can run the end-to-end tests using the following npm scripts:

```bash
# Run all tests
npm run test:e2e

# Run tests with UI mode
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# Show test report
npm run test:e2e:report
```

## Configuration

The Playwright configuration is defined in `playwright.config.ts` in the project root. It includes:

- Browser configurations (Chromium, Firefox, WebKit)
- Mobile device configurations
- Test timeouts and retries
- Screenshot and video recording settings
- Web server setup

## Environment Variables

The tests use the following environment variables:

- `E2E_BASE_URL`: The base URL for the tests (defaults to http://localhost:3000)
- `TEST_USER_EMAIL`: Email for a test user account
- `TEST_USER_PASSWORD`: Password for the test user account

You can set these variables in a `.env` file or directly in your environment.

## Test Utilities

The `utils` directory contains helper functions for common operations:

- `auth.ts`: Authentication utilities (login, logout, etc.)
- `board.ts`: Board-related utilities (creating boards, adding elements, etc.)
- `test-data.ts`: Utilities for generating test data

## Adding New Tests

To add new tests:

1. Create a new file in the appropriate directory (e.g., `e2e/board/my-feature.spec.ts`)
2. Import the necessary utilities and Playwright test functions
3. Write your tests using the Playwright API

Example:

```typescript
import { test, expect } from '@playwright/test';
import { loginViaUI } from '../utils/auth';

test('my new test', async ({ page }) => {
  await loginViaUI(page, 'test@example.com', 'password');
  await page.goto('/my-feature');
  await expect(page.getByText('Expected Text')).toBeVisible();
});
```

## Best Practices

- Keep tests independent and isolated
- Clean up test data after tests
- Use the provided utilities for common operations
- Add appropriate assertions to verify expected behavior
- Use test data generators to avoid hardcoding values
- Group related tests using `test.describe()`
- Use `test.beforeEach()` and `test.afterEach()` for setup and teardown
