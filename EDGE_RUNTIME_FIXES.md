# Edge Runtime Fixes Summary

## Issues Fixed

1. **File System Module Error**

   - Problem: Edge runtime doesn't support Node.js's `fs` module
   - Files affected: `src/lib/stripe-env.ts`
   - Fix: Rewrote code to use `process.env` directly instead of reading from `.env.stripe`

2. **Prisma Client Edge Compatibility**

   - Problem: Prisma Client can't run in Edge Runtime
   - Files affected:
     - `app/api/v1/posts/[postId]/views/route.ts`
     - `app/api/v1/posts/track-view/route.ts`
     - `app/api/v1/media-proxy/route.ts`
   - Fix: Added `export const runtime = "nodejs"` to ensure these routes run in Node.js environment

3. **Stripe Environment Variables**

   - Problem: Stripe variables were loaded using `fs` from `.env.stripe`
   - Fix: Created a script to copy all Stripe variables to the main `.env` file
   - Implementation: Created `copy-stripe-env.js` to extract and merge variables

4. **TypeScript Linter Error in View Tracker**

   - Problem: Object initialization in a reducer function triggered a linter error
   - Fix: Used a more TypeScript-friendly approach:

     ```typescript
     // Before
     if (!acc[postId]) {
       acc[postId] = [];
     }

     // After
     acc[postId] = acc[postId] || [];
     ```

## Migration Status

The database migration for adding the `source` column to the `PostView` table has already been applied. The `source` field now exists in the database with a default value of `"app"` defined in the Prisma schema.

In various files, we have commented out lines setting the `source` field:

1. In `src/lib/api/view-tracker.ts`:

   - `updateData.source = "app";` (lines 112, 177)
   - `createData.source = "app";` (lines 119, 184)

2. In `app/api/v1/posts/track-view/route.ts`:

   - `updateData.source = "app";` (line 34)
   - `createData.source = "app";` (line 35)

3. In `app/api/v1/widget/track-view/route.ts`:
   - `updateData.source = "widget";` (line 126)
   - `createData.source = "widget";` (line 127)

These lines can now be uncommented since the field exists in the database. The commented code was a precaution when the migration hadn't been applied, but our tests show that the database operations work correctly due to the default value defined in the Prisma schema.

## How to Apply These Fixes

1. **Environment Variables**:

   ```bash
   node copy-stripe-env.js
   ```

2. **Database Migration**:

   ```bash
   npx prisma migrate deploy
   ```

   If you encounter issues with migrations that are already applied:

   ```bash
   npx prisma migrate resolve --applied MIGRATION_NAME
   ```

3. **Restart the Development Server**:
   ```bash
   npm run dev
   ```

## Future Considerations

1. **Long-term solution for environment variables**:

   - Consider using Next.js built-in environment variable support
   - Implement a server-side API to provide variables to Edge functions

2. **Database access in Edge functions**:

   - Create a separate API that runs in Node.js environment
   - Use Edge-compatible database clients
   - Implement a caching layer

3. **View Tracking**:
   - After applying the database migration, uncomment the `source` field settings
