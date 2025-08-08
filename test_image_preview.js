// Test script for image preview functionality
const fs = require('fs');
const path = require('path');

async function testImagePreview() {
  console.log('Testing image preview functionality...');
  
  // Test 1: Check if the API endpoint exists
  try {
    const response = await fetch('http://localhost:3000/api/board/test-board-123/files', {
      method: 'GET',
      headers: {
        'Cookie': 'next-auth.session-token=test-token'
      }
    });
    
    console.log('API Response Status:', response.status);
    console.log('API Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('Files found:', data.files?.length || 0);
      
      if (data.files && data.files.length > 0) {
        const imageFile = data.files.find(f => f.type.startsWith('image/'));
        if (imageFile) {
          console.log('Found image file:', imageFile.name, 'ID:', imageFile.id);
          
          // Test 2: Try to preview the image
          const previewResponse = await fetch(`http://localhost:3000/api/board/test-board-123/files?fileId=${imageFile.id}&action=preview`, {
            method: 'GET',
            headers: {
              'Cookie': 'next-auth.session-token=test-token'
            }
          });
          
          console.log('Preview Response Status:', previewResponse.status);
          console.log('Preview Response Headers:', Object.fromEntries(previewResponse.headers.entries()));
          
          if (previewResponse.ok) {
            console.log('✅ Image preview is working!');
            const buffer = await previewResponse.arrayBuffer();
            console.log('Image size:', buffer.byteLength, 'bytes');
          } else {
            console.log('❌ Image preview failed:', previewResponse.status);
            const errorText = await previewResponse.text();
            console.log('Error:', errorText);
          }
        } else {
          console.log('No image files found to test with');
        }
      } else {
        console.log('No files found to test with');
      }
    } else {
      console.log('❌ API request failed:', response.status);
      const errorText = await response.text();
      console.log('Error:', errorText);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testImagePreview();
