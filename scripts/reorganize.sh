#!/bin/bash

echo "Creating new directory structure..."

# Create base directories
mkdir -p src/{app,components,hooks,lib,config,assets,styles,types}
mkdir -p src/components/{ui,layout,auth,posts,navigation}
mkdir -p src/app/{api,auth,orgs,posts,legal,payment}
mkdir -p emails/{templates,utils}
mkdir -p content/posts
mkdir -p public/{fonts,icons,images}
mkdir -p prisma/schema

# Function to safely move files
safe_move() {
    if [ -d "$1" ]; then
        mkdir -p "$2"
        cp -r "$1"/* "$2"/ 2>/dev/null || true
    elif [ -f "$1" ]; then
        mkdir -p "$(dirname "$2")"
        cp "$1" "$2" 2>/dev/null || true
    fi
}

echo "Moving email templates..."
safe_move "emails" "emails/templates"
mv emails/*.email.tsx emails/templates/ 2>/dev/null || true

echo "Moving API routes..."
safe_move "src/app/api" "src/app/api"

echo "Moving auth pages..."
safe_move "src/app/(public)/auth" "src/app/auth"

echo "Moving organization pages..."
safe_move "src/app/(protected)/orgs" "src/app/orgs"

echo "Moving post pages..."
safe_move "src/app/(layout)/posts" "src/app/posts"

echo "Moving legal pages..."
safe_move "src/app/(layout)/legal" "src/app/legal"

echo "Moving payment pages..."
safe_move "src/app/(layout)/payment" "src/app/payment"

echo "Moving components..."
# UI Components
safe_move "src/components/ui" "src/components/ui"
# Layout Components
safe_move "src/components/layout" "src/components/layout"
# Auth Components
safe_move "src/components/auth" "src/components/auth"
# Post Components
safe_move "src/components/posts" "src/components/posts"
# Navigation Components
safe_move "src/components/navigation" "src/components/navigation"

echo "Moving configuration files..."
safe_move "src/config.ts" "src/config/"
safe_move "src/site-config.ts" "src/config/"

echo "Moving assets..."
safe_move "public" "public"
safe_move "src/assets" "src/assets"

echo "Moving Prisma files..."
safe_move "prisma/schema.prisma" "prisma/schema/"
safe_move "prisma/next-auth.prisma" "prisma/schema/"
safe_move "prisma/organization.prisma" "prisma/schema/"

echo "Cleaning up old directories..."
rm -rf app
rm -rf app_backup
rm -rf app_backup_before_reorg
rm -rf "src/app/(public)" 2>/dev/null || true
rm -rf "src/app/(protected)" 2>/dev/null || true
rm -rf "src/app/(layout)" 2>/dev/null || true
rm -rf api_legacy
rm -rf .next
rm -rf dist

# Remove empty directories
find . -type d -empty -delete

echo "Structure reorganization completed!"
echo "Please run 'npm install' and 'npm run build' to rebuild the project."
