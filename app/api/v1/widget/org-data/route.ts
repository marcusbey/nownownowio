import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Get the organization slug from the query params
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'Organization slug is required' }, { status: 400 });
    }
    
    // This is a public API endpoint that doesn't require authentication
    // It's used by the widget script which is embedded on external websites

    // Fetch the organization's public data
    const organization = await prisma.organization.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        websiteUrl: true,
        image: true,
        bannerImage: true,
      },
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Return the organization's public data
    return NextResponse.json({
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        websiteUrl: organization.websiteUrl,
        image: organization.image,
        bannerImage: organization.bannerImage,
      },
    });
  } catch (error) {
    // Return more detailed error information in development
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      : 'Internal server error';
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
