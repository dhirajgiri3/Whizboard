#!/usr/bin/env node

/**
 * Google Drive Integration Test Script
 * 
 * This script tests the Google Drive integration functionality
 * Run with: node scripts/test-google-drive.js
 */

const fetch = require('node-fetch');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';

// Test scenarios
const tests = [
  {
    name: 'Check Google Drive OAuth Start',
    method: 'GET',
    url: '/api/integrations/google-drive/auth/start',
    expectedStatus: 302, // Redirect to Google OAuth
  },
  {
    name: 'Check Google Drive Files API (should fail without auth)',
    method: 'GET',
    url: '/api/integrations/google-drive/files',
    expectedStatus: 401, // Unauthorized
  },
  {
    name: 'Check Google Drive Folders API (should fail without auth)',
    method: 'POST',
    url: '/api/integrations/google-drive/folders',
    body: JSON.stringify({ name: 'Test Folder' }),
    expectedStatus: 401, // Unauthorized
  },
  {
    name: 'Check Board Export API (should fail without auth)',
    method: 'GET',
    url: '/api/board/test-id/export?saveToGoogleDrive=true',
    expectedStatus: 401, // Unauthorized
  },
];

async function runTest(test) {
  console.log(`\n🧪 Running: ${test.name}`);
  
  try {
    const options = {
      method: test.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (test.body) {
      options.body = test.body;
    }

    const response = await fetch(`${BASE_URL}${test.url}`, options);
    
    if (response.status === test.expectedStatus) {
      console.log(`✅ PASS: Expected ${test.expectedStatus}, got ${response.status}`);
    } else {
      console.log(`❌ FAIL: Expected ${test.expectedStatus}, got ${response.status}`);
      if (response.status !== 302) { // Don't log redirect responses
        const text = await response.text();
        console.log(`   Response: ${text.substring(0, 200)}...`);
      }
    }
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Google Drive Integration Tests');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`👤 Test Email: ${TEST_EMAIL}`);
  
  for (const test of tests) {
    await runTest(test);
  }
  
  console.log('\n📋 Test Summary');
  console.log('================');
  console.log('These tests verify that:');
  console.log('1. OAuth flow starts correctly');
  console.log('2. API endpoints require authentication');
  console.log('3. Proper error responses are returned');
  console.log('\nTo test the full integration:');
  console.log('1. Set up Google Cloud Console credentials');
  console.log('2. Configure environment variables');
  console.log('3. Start the development server');
  console.log('4. Test the OAuth flow manually in the browser');
  console.log('5. Test file operations after authentication');
}

// Environment check
function checkEnvironment() {
  console.log('🔍 Environment Check');
  console.log('==================');
  
  const requiredEnvVars = [
    'GOOGLE_DRIVE_CLIENT_ID',
    'GOOGLE_DRIVE_CLIENT_SECRET',
    'MONGODB_URI',
    'NEXTAUTH_SECRET',
  ];
  
  let allSet = true;
  
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      console.log(`✅ ${envVar}: Set`);
    } else {
      console.log(`❌ ${envVar}: Not set`);
      allSet = false;
    }
  }
  
  if (!allSet) {
    console.log('\n⚠️  Some environment variables are missing.');
    console.log('Please check your .env.local file and ensure all required variables are set.');
    console.log('See GOOGLE_DRIVE_SETUP.md for detailed setup instructions.');
  }
  
  return allSet;
}

// Main execution
async function main() {
  console.log('🔧 Google Drive Integration Test Suite');
  console.log('=====================================\n');
  
  const envOk = checkEnvironment();
  
  if (envOk) {
    await runAllTests();
  } else {
    console.log('\n❌ Environment not properly configured. Please fix the issues above and try again.');
    process.exit(1);
  }
}

// Run the tests
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runAllTests, checkEnvironment };
