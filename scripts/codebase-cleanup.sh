#!/bin/bash

echo "Starting comprehensive codebase cleanup..."

# 1. Email Templates Cleanup
echo "Cleaning up email templates..."
mkdir -p emails/utils
# Move any stray email utils to the correct location
find . -name "EmailLayout.tsx" -not -path "./emails/utils/*" -exec mv {} emails/utils/ \;
find . -name "components.utils.tsx" -not -path "./emails/utils/*" -exec mv {} emails/utils/ \;

# 2. Prisma Schema Consolidation
echo "Consolidating Prisma schemas..."
cd prisma/schema
if [ -f "schema.prisma" ] && [ -f "../schema.prisma" ]; then
    echo "Found duplicate schema.prisma files"
    if cmp -s "schema.prisma" "../schema.prisma"; then
        echo "Files are identical, removing duplicate"
        rm "schema.prisma"
    else
        echo "Files differ, creating backup"
        mv "schema.prisma" "schema.prisma.backup"
    fi
fi
cd ../..

# 3. Script Consolidation
echo "Consolidating cleanup scripts..."
mkdir -p scripts/archive
mv scripts/cleanup-duplicates-final.sh scripts/archive/
mv scripts/cleanup-duplicates-safe.sh scripts/archive/
mv scripts/cleanup-final.sh scripts/archive/
mv scripts/cleanup.sh scripts/archive/
mv scripts/reorganize-structure.sh scripts/archive/

# 4. Tailwind Config Consolidation
echo "Consolidating Tailwind configs..."
if [ -f "tailwind.config.js" ] && [ -f "tailwind.config.ts" ]; then
    echo "Found both JS and TS Tailwind configs"
    mv tailwind.config.js tailwind.config.js.old
    echo "Kept TypeScript version (tailwind.config.ts)"
fi

# 5. Config Files Consolidation
echo "Consolidating config files..."
mkdir -p src/config
cat > src/config/index.ts << 'EOL'
export * from './config';
export * from './site-config';
EOL

# 6. Create Documentation
echo "Creating documentation structure..."

# Root README update
cat > README.md << 'EOL'
# NowNowNow.io

## Project Structure
- `/src/` - Application source code
  - `/app/` - Next.js routes and API endpoints
  - `/components/` - Reusable UI components
  - `/lib/` - Core utilities and business logic
  - `/config/` - Configuration files
  - `/features/` - Feature-specific code
- `/emails/` - Email templates and utilities
- `/prisma/` - Database schema and migrations
- `/scripts/` - Maintenance and deployment scripts

## Development
1. Install dependencies: \`npm install\`
2. Set up environment variables: Copy \`.env.example\` to \`.env\`
3. Run development server: \`npm run dev\`

## Architecture
See \`/docs/architecture.md\` for detailed architecture documentation.
EOL

# Architecture Documentation
mkdir -p docs
cat > docs/architecture.md << 'EOL'
# Architecture Overview

## Core Principles
- Component-first architecture
- Feature-based organization
- Centralized configuration
- Type-safe development

## Key Directories

### /src/app
Next.js App Router structure for all routes and API endpoints.

### /src/components
Reusable UI components following atomic design principles.

### /src/features
Feature-specific code, each feature is self-contained with its own components, hooks, and utilities.

### /src/lib
Core utilities, API clients, and business logic.

### /emails
Email templates using React Email and shared utilities.

## Best Practices
- Use absolute imports with @/ prefix
- Follow TypeScript strict mode
- Implement proper error boundaries
- Use React Query for data fetching
EOL

# Create README files in major directories
directories=(
    "src/app"
    "src/components"
    "src/features"
    "src/lib"
    "prisma"
    "scripts"
)

for dir in "${directories[@]}"; do
    mkdir -p "$dir"
    echo "Creating README for $dir"
    cat > "$dir/README.md" << EOL
# ${dir#*/}

## Purpose
$(case ${dir#*/} in
    "app") echo "Next.js App Router routes and API endpoints.";;
    "components") echo "Reusable UI components following atomic design principles.";;
    "features") echo "Feature-specific code organized by domain.";;
    "lib") echo "Core utilities and business logic shared across the application.";;
    "prisma") echo "Database schema, migrations, and Prisma client configuration.";;
    "scripts") echo "Maintenance, deployment, and development automation scripts.";;
esac)

## Guidelines
- Follow TypeScript strict mode
- Use absolute imports (@/...)
- Keep files focused and maintainable
EOL
done

echo "Cleanup completed! Please review the changes and run tests."
echo "1. Check backup files in scripts/archive/"
echo "2. Verify email template imports"
echo "3. Test the application"
