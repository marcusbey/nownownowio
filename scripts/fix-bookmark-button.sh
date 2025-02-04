#!/bin/bash

echo "Fixing BookmarkButton component duplication..."

# Backup the old version
echo "Creating backup of the old version..."
cp src/components/ui/BookmarkButton.tsx src/components/ui/BookmarkButton.tsx.old

# Remove the old version
echo "Removing old version..."
rm src/components/ui/BookmarkButton.tsx

echo "The better version in src/components/ui/posts/BookmarkButton.tsx has been kept."
echo "Please update any imports to use @/components/ui/posts/BookmarkButton"
echo "A backup of the old version is at src/components/ui/BookmarkButton.tsx.old"
