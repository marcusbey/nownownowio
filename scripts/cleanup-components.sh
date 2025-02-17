#!/bin/bash

cd "$(dirname "$0")/.."

echo "Cleaning up component repository..."

# Remove old directories that should no longer exist
echo "Removing old directories..."
rm -rf src/components/ui
rm -rf src/components/utils
rm -rf src/components/svg
rm -rf src/components/magicui
rm -rf src/components/settings

# Remove duplicate files at the root level
echo "Removing duplicate files..."
rm -f src/components/CropImageDialog.tsx
rm -f src/components/FollowButton.tsx
rm -f src/components/FollowerCount.tsx
rm -f src/components/InfiniteScrollContainer.tsx
rm -f src/components/Linkify.tsx
rm -f src/components/LoadingButton.tsx
rm -f src/components/PasswordInput.tsx
rm -f src/components/UserAvatar.tsx
rm -f src/components/UserLinkWithTooltip.tsx
rm -f src/components/UserTooltip.tsx

echo "Done cleaning up components!"

# List remaining files for verification
echo "Current component structure:"
find src/components -type f -name "*.tsx" -o -name "*.ts" | sort
