#!/bin/bash

echo "Starting comprehensive cleanup..."

# 1. Email Template Consolidation
echo "Consolidating email templates..."
mkdir -p emails/templates
mv emails/*.tsx emails/templates/ 2>/dev/null
mkdir -p emails/utils
mv emails/templates/utils/* emails/utils/ 2>/dev/null
rm -rf emails/templates/utils
rm -rf emails/templates/templates

# 2. Prisma Schema Cleanup
echo "Cleaning up Prisma schema..."
if cmp -s "prisma/schema/schema.prisma" "prisma/schema.prisma"; then
    rm prisma/schema/schema.prisma
else
    mv prisma/schema/schema.prisma prisma/schema/schema.backup.prisma
fi

# 3. Scripts Cleanup
echo "Cleaning up scripts..."
rm -f scripts/cleanup-duplicates.sh
rm -f scripts/reorganize-structure.sh
mv scripts/cleanup-duplicates-v2.sh scripts/cleanup.sh
mv scripts/reorganize-new-structure.sh scripts/reorganize.sh

# 4. Create Documentation Structure
echo "Creating documentation structure..."

# Root README
cat > docs/README.md << 'EOL'
# Project Documentation

## Directory Structure
- `/src/app/`: Next.js routes and API endpoints
- `/components/`: Reusable UI components
- `/lib/`: Core utilities and business logic
- `/emails/`: Email templates and utilities
- `/scripts/`: Maintenance and deployment scripts

## Coding Guidelines
- Use absolute imports with @/ prefix
- Follow functional programming patterns
- Use TypeScript for all new code
- Implement proper error boundaries
EOL

# App Directory README
cat > src/app/README.md << 'EOL'
# Route Structure

## Route Groups
- `(account-layout)`: Account management pages
- `api/`: API endpoints
- `auth/`: Authentication flows
- `legal/`: Terms and privacy pages
- `orgs/`: Organization management
- `posts/`: Post-related pages

## Conventions
- Use route groups (parentheses) for shared layouts
- Keep API routes in dedicated folders
- Implement proper error boundaries per route
EOL

# Email Templates README
cat > emails/README.md << 'EOL'
# Email Templates

## Structure
- `templates/`: All email templates
- `utils/`: Shared email components and utilities

## Guidelines
- Use TypeScript for all templates
- Import utilities from @/emails/utils
- Follow consistent styling patterns
EOL

# Clean up empty directories
echo "Cleaning up empty directories..."
find . -type d -empty -delete

echo "Cleanup completed! Please verify the changes and run tests."
