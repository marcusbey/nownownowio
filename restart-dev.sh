#!/bin/bash

# Stop any running Next.js instances
echo "Stopping any running Next.js instances..."
pkill -f "next dev" || true

# Clean Next.js cache
echo "Cleaning Next.js cache..."
rm -rf .next

# Clean node_modules/.cache
echo "Cleaning node modules cache..."
rm -rf node_modules/.cache

# Install dependencies if needed
echo "Checking for missing dependencies..."
pnpm install

# Start Next.js in dev mode
echo "Starting Next.js development server..."
npm run dev 