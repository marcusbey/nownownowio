/**
 * Script to directly test tracking views using Prisma
 * This bypasses the API route to verify our database operations work correctly
 * Run with: node test-track-view.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDirectTrackView() {
  try {
    console.log('Starting direct view tracking test...');
    
    // Fetch a real post ID from the database
    console.log('Finding a valid post to track...');
    const post = await prisma.post.findFirst({
      select: { id: true, title: true }
    });
    
    if (!post) {
      console.error('No posts found in the database. Please create a post first.');
      return;
    }
    
    console.log(`Found post: ${post.title} (${post.id})`);
    
    // Create a test viewer ID
    const viewerId = `test-viewer-${Date.now()}`;
    const clientIp = '127.0.0.1';
    
    console.log(`Tracking view with viewerId: ${viewerId} and IP: ${clientIp}`);
    
    // Create the view record
    const view = await prisma.postView.upsert({
      where: {
        postId_viewerId_clientIp: {
          postId: post.id,
          viewerId,
          clientIp,
        },
      },
      update: {
        viewedAt: new Date(),
        // The source field is commented out as in the API route
        // source: "test",
      },
      create: {
        post: { connect: { id: post.id } },
        viewerId,
        clientIp,
        // The source field is commented out as in the API route
        // source: "test",
      },
    });
    
    console.log('Successfully tracked view:');
    console.log(view);
    
    // Get the view count
    const count = await prisma.postView.count({
      where: { postId: post.id },
    });
    
    console.log(`Total views for post ${post.id}: ${count}`);
    
  } catch (error) {
    console.error('Error tracking view:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDirectTrackView(); 