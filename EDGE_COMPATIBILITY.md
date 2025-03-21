# Edge Runtime Compatibility Fixes

## Overview

This document outlines the changes made to ensure the application is compatible with Next.js Edge Runtime.

## Problem

The API routes were failing with 500 errors due to the use of Node.js-specific modules like `fs` in code paths that run in the Edge Runtime. The specific error was:

```
Module not found: Can't resolve 'fs' in ./src/lib/stripe-env.ts
```

After fixing the `fs` module issue, we encountered another problem with Prisma Client not being compatible with Edge Runtime:

```
Error: Prisma Client cannot be used in Edge Runtime. You're seeing this error because you're trying to use Prisma Client in a middleware or API route that's configured to use Edge Runtime. Please use a traditional Node.js API route by adding 'export const runtime = "nodejs";' to your route file.
```

This was affecting:

- Post view tracking endpoints
- Media proxy
- Other Edge API routes

## Changes Made

### 1. Simplified `stripe-env.ts`

We modified `src/lib/stripe-env.ts` to not use file system operations:

- Removed `fs` and `path` imports
- Changed `loadStripeEnv()` to only use `process.env` variables instead of reading from a `.env.stripe` file
- Updated `getStripeEnvVar()` to directly use environment variables

### 2. Moved Stripe Environment Variables

Previously, Stripe variables were stored in a separate `.env.stripe` file and loaded using the `fs` module. Since we can't use `fs` in Edge runtime, we:

- Created a script (`copy-stripe-env.js`) to copy all variables from `.env.stripe` to the main `.env` file
- Updated code to read Stripe variables directly from `process.env`

This ensures all Stripe-related environment variables are accessible without needing file system operations.

### 3. Fixed Linter Error in View Tracker

Fixed a linter error in `src/lib/api/view-tracker.ts` related to object initialization in a reducer function:

```typescript
// Before
if (!acc[postId]) {
  acc[postId] = [];
}

// After
acc[postId] = acc[postId] || [];
```

### 4. Changed API Route Runtime

We updated several API routes to use the Node.js runtime instead of Edge Runtime:

- Changed `app/api/v1/posts/[postId]/views/route.ts` from `edge` to `nodejs` runtime
- Changed `app/api/v1/posts/track-view/route.ts` from implicit edge to explicit `nodejs` runtime
- Added `export const runtime = 'nodejs'` to `app/api/v1/media-proxy/route.ts`

## Impact of Changes

- API routes are now correctly configured to use Node.js runtime when they need Prisma
- Solved the 500 errors in the view tracking endpoints
- Simplified environment variable handling
- Fixed media proxy issues
- Consolidated Stripe environment variables into a single `.env` file for better compatibility

## When to Use Edge vs Node.js Runtime

- **Edge Runtime**: Use for API routes that don't need Node.js-specific features or Prisma database access. Edge Runtime is faster but has limitations.
- **Node.js Runtime**: Use for API routes that need:
  - Prisma database access
  - Node.js-specific modules (`fs`, `path`, etc.)
  - Full Node.js API support

## Future Considerations

1. For more complex environment variable handling in Edge Runtime, consider:

   - Using environment variables directly (as we've done)
   - Using Next.js built-in environment variable support
   - Implementing a server-side API endpoint to provide environment variables to Edge functions

2. For database access in Edge functions, consider:
   - Creating a separate API that runs in Node.js environment
   - Using Edge-compatible database drivers
   - Implementing a caching layer
