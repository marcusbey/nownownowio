import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/helper';

export async function POST(request: Request) {
  try {
    console.log('API: Update website URL request received');
    
    // Parse the request body
    const { orgSlug, websiteUrl } = await request.json();
    console.log('API: Request for org slug:', orgSlug);

    if (!orgSlug || typeof orgSlug !== 'string') {
      console.log('API: Missing organization slug');
      return NextResponse.json({ error: 'Organization slug is required' }, { status: 400 });
    }

    if (!websiteUrl || typeof websiteUrl !== 'string') {
      console.log('API: Missing or invalid website URL');
      return NextResponse.json({ error: 'Website URL is required' }, { status: 400 });
    }

    // Basic URL validation
    try {
      new URL(websiteUrl);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid website URL format' }, { status: 400 });
    }

    // Get the current user
    console.log('API: Authenticating user');
    const user = await auth();
    if (!user) {
      console.log('API: Authentication failed');
      return NextResponse.json({ 
        error: 'Unauthorized', 
        details: 'You must be logged in to update the website URL'
      }, { status: 401 });
    }
    console.log('API: User authenticated:', user.id);

    // Fetch the organization and check if the user is a member with appropriate permissions
    const organization = await prisma.organization.findUnique({
      where: { slug: orgSlug },
      select: {
        id: true,
        members: {
          where: {
            userId: user.id,
            role: {
              in: ['OWNER', 'ADMIN'],
            },
          },
          select: {
            role: true,
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Check if the user has permission to update organization settings
    if (organization.members.length === 0) {
      return NextResponse.json({ 
        error: 'You do not have permission to update organization settings' 
      }, { status: 403 });
    }

    // Update the organization's website URL
    const updatedOrg = await prisma.organization.update({
      where: { id: organization.id },
      data: { websiteUrl },
      select: {
        id: true,
        name: true,
        slug: true,
        websiteUrl: true,
      },
    });

    // Return the updated organization data
    return NextResponse.json({
      message: 'Website URL updated successfully',
      organization: updatedOrg,
    });
  } catch (error) {
    console.error('API: Error updating website URL:', error);
    // Return more detailed error information in development
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      : 'Internal server error';
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
