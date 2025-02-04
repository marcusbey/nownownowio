#!/bin/bash

echo "Starting cleanup of duplicate files..."

# 1. Consolidate UI components
echo "Consolidating UI components..."
mkdir -p src/components/ui
mv src/components/*.tsx src/components/ui/ 2>/dev/null
rm -rf src/components/skeletons
rm -rf src/components/svg

# 2. Clean up email templates
echo "Cleaning up email templates..."
mkdir -p emails/templates
find emails/templates/templates -type f -name "*.tsx" -exec mv {} emails/templates/ \;
rm -rf emails/templates/templates

# 3. Remove duplicate layout components
echo "Removing duplicate layout components..."
rm -rf src/components/layout/legal
rm -rf src/components/layout/payment
rm -rf src/components/layout/posts

# 4. Clean up empty directories
echo "Cleaning up empty directories..."
find . -type d -empty -delete

echo "Cleanup completed! Please verify the changes and run tests."
