import { getNextAuthConfigProviders } from "@/lib/auth/getNextAuthConfigProviders";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

// Prisma doesn't work in Edge runtime, so we need to use NodeJS runtime
export const runtime = "nodejs";

export async function GET() {
    try {
        const providers = getNextAuthConfigProviders();

        // For the client, we just need a simple object that indicates which providers are available
        // This matches the structure expected by the sign-in-providers.tsx component
        // Disable TS any linting because NextAuth provider types are complex

        const providersForClient: Record<string, { id: string }> = {};

        // Check for each provider type
        for (const provider of providers) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const p = provider as any;

            if (p.id === 'credentials' || p.type === 'credentials') {
                providersForClient.credentials = { id: 'credentials' };
            }

            if (p.id === 'resend' || p.type === 'email') {
                providersForClient.resend = { id: 'resend' };
            }

            if (p.id === 'github' || (p.name && typeof p.name === 'string' && p.name.toLowerCase().includes('github'))) {
                providersForClient.github = { id: 'github' };
            }

            if (p.id === 'google' || (p.name && typeof p.name === 'string' && p.name.toLowerCase().includes('google'))) {
                providersForClient.google = { id: 'google' };
            }

            if (p.id === 'twitter' || (p.name && typeof p.name === 'string' && p.name.toLowerCase().includes('twitter'))) {
                providersForClient.twitter = { id: 'twitter' };
            }
        }

        logger.info("[Auth] Providers fetched successfully", {
            providerIds: Object.keys(providersForClient)
        });

        return NextResponse.json(providersForClient);
    } catch (error) {
        logger.error("[Auth] Failed to fetch providers", { error });
        return NextResponse.json(
            { error: "Failed to load authentication providers" },
            { status: 500 }
        );
    }
} 