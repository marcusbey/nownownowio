#!/bin/bash

echo "Starting safe cleanup of duplicate files..."

# Function to safely move files
safe_move() {
    local src=$1
    local dest=$2
    if [ -f "$src" ] && [ ! -f "$dest" ]; then
        mkdir -p $(dirname "$dest")
        cp "$src" "$dest"
        echo "Moved: $src -> $dest"
    elif [ -f "$src" ] && [ -f "$dest" ]; then
        echo "Warning: Both source and destination exist: $src and $dest"
        diff -q "$src" "$dest" > /dev/null
        if [ $? -eq 0 ]; then
            echo "Files are identical, safe to remove source"
            rm "$src"
        else
            echo "Files differ, creating backup"
            cp "$src" "${src}.backup"
        fi
    fi
}

# 1. Create component directories
mkdir -p src/components/ui/{posts,comments,auth}

# 2. Handle Posts Components
echo "Consolidating post components..."
for file in src/components/posts/*.tsx; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        safe_move "$file" "src/components/ui/posts/$filename"
    fi
done

# 3. Handle Comments Components
echo "Consolidating comment components..."
for file in src/components/comments/*.tsx; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        safe_move "$file" "src/components/ui/comments/$filename"
    fi
done

# 4. Handle Auth Components
echo "Consolidating auth components..."
for file in src/components/auth/*.tsx; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        safe_move "$file" "src/components/ui/auth/$filename"
    fi
done

# 5. Handle Email Templates
echo "Consolidating email templates..."
mkdir -p emails/{templates,utils}

# Move email utils first
safe_move "emails/templates/EmailLayout.tsx" "emails/utils/EmailLayout.tsx"
safe_move "emails/templates/components.utils.tsx" "emails/utils/components.utils.tsx"

# Move email templates
for file in emails/*.tsx; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        safe_move "$file" "emails/templates/$filename"
    fi
done

# 6. Create documentation
echo "Creating component documentation..."
cat > src/components/ui/README.md << 'EOL'
# UI Components

This directory contains all reusable UI components following our component-first architecture.

## Directory Structure
- /posts: Post-related components (PostCard, PostEditor, etc.)
- /comments: Comment system components (CommentList, CommentForm, etc.)
- /auth: Authentication components (LoginForm, SignupForm, etc.)

## Guidelines
- Use absolute imports (@/components/ui/...)
- Follow functional component patterns
- Maintain TypeScript types
- Keep components small and focused
EOL

echo "Creating backup list..."
find . -name "*.backup" > cleanup-backups.txt

echo "Cleanup completed! Please review cleanup-backups.txt for any backup files created."
echo "Run tests before removing backup files."
