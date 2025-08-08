const fetch = require('node-fetch');

// Test Configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  testBoardId: '688b5a63e2438f87ecc4f818', // Use a real board ID from the logs
  sessionToken: null // Will be set after login
};

// Test Results
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

function logTest(name, success, details = '') {
  const emoji = success ? '✅' : '❌';
  const status = success ? 'PASS' : 'FAIL';
  console.log(`${emoji} ${name}: ${status}`);
  if (details) console.log(`   Details: ${details}`);
  
  results.total++;
  if (success) {
    results.passed++;
  } else {
    results.failed++;
    results.errors.push({ name, details });
  }
}

function logSection(title) {
  console.log(`\n📋 ${title}`);
  console.log('='.repeat(50));
}

function logSummary() {
  console.log('\n📊 Test Summary');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${results.total}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ Failed Tests:');
    results.errors.forEach(error => {
      console.log(`   - ${error.name}: ${error.details}`);
    });
  }
}

async function testExportFeatures() {
  logSection('Testing Export Features');
  
  // Test PNG Export
  try {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/board/${TEST_CONFIG.testBoardId}/export?format=png&resolution=1x&background=transparent`, {
      headers: {
        'Cookie': `next-auth.session-token=${TEST_CONFIG.sessionToken}`
      }
    });
    if (response.ok) {
      const buffer = await response.buffer();
      logTest('Basic PNG Export', true, `File size: ${buffer.length} bytes`);
    } else {
      logTest('Basic PNG Export', false, `HTTP ${response.status}`);
    }
  } catch (error) {
    logTest('Basic PNG Export', false, error.message);
  }
  
  // Test SVG Export
  try {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/board/${TEST_CONFIG.testBoardId}/export?format=svg`, {
      headers: {
        'Cookie': `next-auth.session-token=${TEST_CONFIG.sessionToken}`
      }
    });
    if (response.ok) {
      const text = await response.text();
      if (text.includes('<svg') && text.includes('</svg>')) {
        logTest('Basic SVG Export', true, 'Valid SVG structure');
      } else {
        logTest('Basic SVG Export', false, 'Invalid SVG structure');
      }
    } else {
      logTest('Basic SVG Export', false, `HTTP ${response.status}`);
    }
  } catch (error) {
    logTest('Basic SVG Export', false, error.message);
  }
  
  // Test JSON Export
  try {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/board/${TEST_CONFIG.testBoardId}/export?format=json`, {
      headers: {
        'Cookie': `next-auth.session-token=${TEST_CONFIG.sessionToken}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      if (data.id && data.elements) {
        logTest('Basic JSON Export', true, `Board with ${data.elements.length} elements`);
      } else {
        logTest('Basic JSON Export', false, 'Invalid JSON structure');
      }
    } else {
      logTest('Basic JSON Export', false, `HTTP ${response.status}`);
    }
  } catch (error) {
    logTest('Basic JSON Export', false, error.message);
  }
}

async function testImportFeatures() {
  logSection('Testing Import Features');
  
  // Test Image Import
  try {
    const mockImageBuffer = Buffer.from('fake image data');
    const formData = new FormData();
    formData.append('file', mockImageBuffer, 'test-image.png');
    formData.append('type', 'image');
    formData.append('options', JSON.stringify({ scale: 1, position: 'center' }));
    
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/board/${TEST_CONFIG.testBoardId}/import`, {
      method: 'POST',
      headers: {
        'Cookie': `next-auth.session-token=${TEST_CONFIG.sessionToken}`
      },
      body: formData
    });
    
    logTest('Image Import', response.ok, response.ok ? 'Image imported successfully' : `HTTP ${response.status}`);
  } catch (error) {
    logTest('Image Import', false, error.message);
  }
  
  // Test JSON Import
  try {
    const mockJsonData = {
      version: '1.0',
      elements: [{ id: '1', type: 'text', data: { text: 'Test' }, style: {} }]
    };
    
    const mockJsonBuffer = Buffer.from(JSON.stringify(mockJsonData));
    const formData = new FormData();
    formData.append('file', mockJsonBuffer, 'test-board.json');
    formData.append('type', 'json');
    formData.append('options', JSON.stringify({ merge: true }));
    
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/board/${TEST_CONFIG.testBoardId}/import`, {
      method: 'POST',
      headers: {
        'Cookie': `next-auth.session-token=${TEST_CONFIG.sessionToken}`
      },
      body: formData
    });
    
    logTest('JSON Import', response.ok, response.ok ? 'JSON imported successfully' : `HTTP ${response.status}`);
  } catch (error) {
    logTest('JSON Import', false, error.message);
  }
  
  // Test Template Import
  try {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/board/${TEST_CONFIG.testBoardId}/import?type=templates`, {
      headers: {
        'Cookie': `next-auth.session-token=${TEST_CONFIG.sessionToken}`
      }
    });
    if (response.ok) {
      const templates = await response.json();
      if (Array.isArray(templates)) {
        logTest('Template Import', true, `${templates.length} templates available`);
      } else {
        logTest('Template Import', false, 'Invalid template response');
      }
    } else {
      logTest('Template Import', false, `HTTP ${response.status}`);
    }
  } catch (error) {
    logTest('Template Import', false, error.message);
  }
}

async function testFileManagement() {
  logSection('Testing File Management');
  
  // Test File List
  try {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/board/${TEST_CONFIG.testBoardId}/files`, {
      headers: {
        'Cookie': `next-auth.session-token=${TEST_CONFIG.sessionToken}`
      }
    });
    if (response.ok) {
      const files = await response.json();
      if (Array.isArray(files)) {
        logTest('File List', true, `${files.length} files found`);
      } else {
        logTest('File List', false, 'Invalid file list response');
      }
    } else {
      logTest('File List', false, `HTTP ${response.status}`);
    }
  } catch (error) {
    logTest('File List', false, error.message);
  }
  
  // Test File Upload
  try {
    const mockFileBuffer = Buffer.from('test file content');
    const formData = new FormData();
    formData.append('file', mockFileBuffer, 'test-file.txt');
    formData.append('name', 'Test File');
    formData.append('description', 'Test file for upload');
    formData.append('tags', 'test,upload');
    
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/board/${TEST_CONFIG.testBoardId}/files`, {
      method: 'POST',
      headers: {
        'Cookie': `next-auth.session-token=${TEST_CONFIG.sessionToken}`
      },
      body: formData
    });
    
    logTest('File Upload', response.ok, response.ok ? 'File uploaded successfully' : `HTTP ${response.status}`);
  } catch (error) {
    logTest('File Upload', false, error.message);
  }
  
  // Test File Search
  try {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/board/${TEST_CONFIG.testBoardId}/files?search=test`, {
      headers: {
        'Cookie': `next-auth.session-token=${TEST_CONFIG.sessionToken}`
      }
    });
    if (response.ok) {
      const files = await response.json();
      logTest('File Search', true, `Search returned ${files.length} results`);
    } else {
      logTest('File Search', false, `HTTP ${response.status}`);
    }
  } catch (error) {
    logTest('File Search', false, error.message);
  }
}

async function testErrorHandling() {
  logSection('Testing Error Handling');
  
  // Test Invalid Board ID
  try {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/board/invalid-id/export`);
    logTest('Invalid Board ID', response.status === 404, 
      response.status === 404 ? 'Proper 404 error returned' : `Expected 404, got ${response.status}`);
  } catch (error) {
    logTest('Invalid Board ID', false, error.message);
  }
  
  // Test Unauthorized Access
  try {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/board/${TEST_CONFIG.testBoardId}/export`);
    logTest('Unauthorized Access', response.status === 401, 
      response.status === 401 ? 'Proper 401 error returned' : `Expected 401, got ${response.status}`);
  } catch (error) {
    logTest('Unauthorized Access', false, error.message);
  }
}

async function runAllTests() {
  console.log('🎯 Phase 3 Feature Test Suite');
  console.log('Testing: Export/Import & File Management\n');
  
  try {
    await testExportFeatures();
    await testImportFeatures();
    await testFileManagement();
    await testErrorHandling();
    
    logSummary();
    
    if (results.failed === 0) {
      console.log('\n🎉 All Phase 3 features are working correctly!');
      return true;
    } else {
      console.log('\n⚠️  Some Phase 3 features need attention.');
      return false;
    }
  } catch (error) {
    console.error('❌ Test runner error:', error);
    return false;
  }
}

// Run tests
runAllTests().then(success => {
  process.exit(success ? 0 : 1);
}); 