#!/bin/bash

echo "Starting final cleanup of duplicate files..."

# 1. Components Consolidation
echo "Consolidating components..."
# Move all UI components to src/components/ui
mkdir -p src/components/ui
# Move duplicated components from components/posts to ui/posts
cp -r src/components/posts/* src/components/ui/posts/ 2>/dev/null
rm -rf src/components/posts
# Move duplicated components from components/comments to ui/comments
cp -r src/components/comments/* src/components/ui/comments/ 2>/dev/null
rm -rf src/components/comments
# Move duplicated auth components
cp -r src/components/auth/* src/components/ui/auth/ 2>/dev/null
rm -rf src/components/auth

# 2. Email Templates Consolidation
echo "Consolidating email templates..."
mkdir -p emails/templates
mv emails/*.tsx emails/templates/ 2>/dev/null
# Move utils to a single location
mkdir -p emails/utils
mv emails/templates/utils/* emails/utils/ 2>/dev/null
mv emails/templates/EmailLayout.tsx emails/utils/ 2>/dev/null
mv emails/templates/components.utils.tsx emails/utils/ 2>/dev/null
rm -rf emails/templates/utils

# 3. Config Files Consolidation
echo "Consolidating config files..."
mkdir -p src/config
mv src/config.ts src/config/
cat src/config/config.ts src/config/site-config.ts src/config/site.ts > src/config/config.combined.ts
rm src/config/config.ts src/config/site-config.ts src/config/site.ts
mv src/config/config.combined.ts src/config/config.ts

# 4. Utils Consolidation
echo "Consolidating utils..."
mkdir -p src/utils
mv src/components/utils/* src/utils/ 2>/dev/null
rm -rf src/components/utils
mv src/lib/utils/* src/utils/ 2>/dev/null
rm -rf src/lib/utils

# 5. Remove empty directories
echo "Cleaning up empty directories..."
find . -type d -empty -delete

# 6. Create documentation
echo "Creating documentation..."
cat > src/components/ui/README.md << 'EOL'
# UI Components

This directory contains all reusable UI components.

## Structure
- /auth: Authentication-related components
- /comments: Comment system components
- /posts: Post-related components
- /utils: Utility components

## Guidelines
- Use TypeScript for all components
- Follow functional component patterns
- Import from @/components/ui/[component]
EOL

echo "Cleanup completed! Please verify the changes and run tests."
