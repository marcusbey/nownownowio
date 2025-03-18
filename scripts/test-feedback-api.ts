/**
 * Test script for the feedback API endpoints
 * 
 * This script tests the following endpoints:
 * - GET /api/v1/widget/org-feedback
 * 
 * It generates a valid widget token and tests the API with real organization data
 */

import { createHmac } from 'crypto';
import { prisma } from '../src/lib/prisma';

// Configuration
const API_BASE_URL = 'http://localhost:3000/api/v1/widget';
const WIDGET_TOKEN_SECRET = process.env.WIDGET_TOKEN_SECRET || 'test-secret';

/**
 * Generate a widget token for the given organization ID
 */
function generateWidgetToken(organizationId: string): string {
  const timestamp = Date.now();
  const payload = `${organizationId}:${timestamp}`;
  const signature = createHmac('sha256', WIDGET_TOKEN_SECRET)
    .update(payload)
    .digest('hex');
  
  return Buffer.from(`${payload}:${signature}`).toString('base64');
}

/**
 * Test the feedback API endpoint
 */
async function testFeedbackApi(): Promise<void> {
  try {
    // Get a real organization ID from the database
    const organization = await prisma.organization.findFirst({
      where: {
        Widget: {
          some: {}
        }
      },
      select: {
        id: true,
        name: true
      }
    });

    if (!organization) {
      console.error('No organization with widget found in the database');
      return;
    }

    console.log(`Testing with organization: ${organization.name} (${organization.id})`);
    
    // Generate a valid token
    const token = generateWidgetToken(organization.id);
    console.log(`Generated token: ${token}`);
    
    // Test GET /api/v1/widget/org-feedback
    const feedbackUrl = `${API_BASE_URL}/org-feedback?orgId=${organization.id}`;
    console.log(`Testing GET ${feedbackUrl}`);
    
    const response = await fetch(feedbackUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Test passed!');
    } else {
      console.error('❌ Test failed!');
    }
  } catch (error) {
    console.error('Error testing feedback API:', error);
  } finally {
    // Close Prisma client
    await prisma.$disconnect();
  }
}

// Run the test
testFeedbackApi().catch(console.error);
