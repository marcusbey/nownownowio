#!/bin/bash

# =================================================================
# Comprehensive Codebase Cleanup Script
# =================================================================
# This script provides a comprehensive set of cleanup operations for the codebase.
# It includes safe cleanup operations and more aggressive cleanup options.
# 
# Usage:
#   ./cleanup.sh [--safe|--full]
#     --safe  : Run only safe cleanup operations
#     --full  : Run all cleanup operations including aggressive ones
# =================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Safe cleanup operations
safe_cleanup() {
    log_info "Running safe cleanup operations..."
    
    # Remove common temporary files
    find . -type f -name "*.log" -delete
    find . -type f -name "*.tmp" -delete
    find . -type f -name ".DS_Store" -delete
    
    # Remove empty directories
    find . -type d -empty -delete
    
    # Clean npm cache
    npm cache clean --force
    
    # Remove node_modules and reinstall
    rm -rf node_modules
    npm install
    
    # Run TypeScript checks
    npm run ts
    
    # Run linter and formatter
    npm run lint
    npm run format
    
    log_info "Safe cleanup completed successfully!"
}

# Full cleanup operations
full_cleanup() {
    log_info "Running full cleanup operations..."
    
    # Run safe cleanup first
    safe_cleanup
    
    # Remove build artifacts
    rm -rf .next
    rm -rf dist
    rm -rf build
    
    # Clean Git
    git clean -fd
    git reset --hard
    
    # Remove all untracked files (use with caution)
    git clean -fdx
    
    # Rebuild everything
    npm run build
    
    log_info "Full cleanup completed successfully!"
}

# Main script
case "$1" in
    --safe)
        safe_cleanup
        ;;
    --full)
        read -p "This will remove all untracked files and reset all changes. Are you sure? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]
        then
            full_cleanup
        else
            log_warn "Cleanup cancelled by user"
            exit 1
        fi
        ;;
    *)
        echo "Usage: $0 [--safe|--full]"
        echo "  --safe  : Run only safe cleanup operations"
        echo "  --full  : Run all cleanup operations including aggressive ones"
        exit 1
        ;;
esac
