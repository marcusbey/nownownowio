/**
 * Script to test the API route for tracking post views
 * Run with: node test-api-view.js
 */

const http = require('http');
const fs = require('fs');

// Get the post ID from the test script output
async function getPostId() {
  try {
    // We could use an API call here, but for simplicity let's use the direct method
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const post = await prisma.post.findFirst({
      select: { id: true, title: true }
    });
    
    await prisma.$disconnect();
    
    if (!post) {
      console.error('No posts found in database');
      process.exit(1);
    }
    
    return post.id;
  } catch (error) {
    console.error('Error finding post:', error);
    process.exit(1);
  }
}

// Send a request to the view tracking API
async function trackViewViaAPI(postId) {
  return new Promise((resolve, reject) => {
    const viewerId = `api-test-${Date.now()}`;
    
    const data = JSON.stringify({
      postId,
      viewerId
    });
    
    const options = {
      hostname: 'localhost',
      port: 3000,  // Updated to match the actual NextJS port
      path: '/api/v1/posts/track-view',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    console.log(`Sending request to track view for post ${postId} with viewer ${viewerId}`);
    
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log(`API Response Status: ${res.statusCode}`);
        
        try {
          const jsonResponse = JSON.parse(responseData);
          console.log('API Response Body:', jsonResponse);
          resolve({
            status: res.statusCode,
            body: jsonResponse
          });
        } catch (e) {
          console.log('Raw Response:', responseData);
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Error sending request:', error);
      reject(error);
    });
    
    req.write(data);
    req.end();
  });
}

// Main function
async function main() {
  try {
    console.log('Starting API test for view tracking...');
    
    // Get a valid post ID
    const postId = await getPostId();
    console.log(`Found post ID: ${postId}`);
    
    // Test the API
    const result = await trackViewViaAPI(postId);
    
    if (result.status === 200) {
      console.log('API test successful!');
    } else {
      console.log(`API test failed with status ${result.status}`);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

main(); 