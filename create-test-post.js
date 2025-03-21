/**
 * Script to create a test post in the database
 * Run with: node create-test-post.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestPost() {
  try {
    console.log('Looking up users in the database...');
    // Find the first user in the database
    const user = await prisma.user.findFirst();
    
    if (!user) {
      console.error('No users found in the database. Please create a user first.');
      return;
    }
    
    console.log(`Found user: ${user.name} (${user.id})`);
    
    // Create a test post
    const post = await prisma.post.create({
      data: {
        title: 'Test Post for API Testing',
        content: 'This is a test post created to test the API endpoints.',
        userId: user.id,
      },
    });
    
    console.log('Test post created successfully:');
    console.log(`- ID: ${post.id}`);
    console.log(`- Title: ${post.title}`);
    console.log(`- User ID: ${post.userId}`);
    console.log(`- Created at: ${post.createdAt}`);
    console.log('\nYou can use this post ID for testing the track-view API.');
    
  } catch (error) {
    console.error('Error creating test post:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestPost(); 