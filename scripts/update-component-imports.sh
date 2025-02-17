#!/bin/bash

cd "$(dirname "$0")/.."

# Core components
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
  -e 's|@/components/ui/button|@/components/core/button|g' \
  -e 's|@/components/ui/input|@/components/core/input|g' \
  -e 's|@/components/ui/textarea|@/components/core/textarea|g' \
  -e 's|@/components/ui/select|@/components/core/select|g' \
  -e 's|@/components/ui/checkbox|@/components/core/checkbox|g' \
  -e 's|@/components/ui/switch|@/components/core/switch|g' \
  -e 's|@/components/ui/toggle|@/components/core/toggle|g' \
  -e 's|@/components/ui/label|@/components/core/label|g' \
  -e 's|@/components/ui/form|@/components/core/form|g' \
  -e 's|@/components/PasswordInput|@/components/core/PasswordInput|g' \
  -e 's|@/components/ui/visually-hidden|@/components/core/visually-hidden|g'

# Composite components
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
  -e 's|@/components/ui/multi-select|@/components/composite/multi-select|g' \
  -e 's|@/components/ui/command|@/components/composite/command|g' \
  -e 's|@/components/ui/dialog|@/components/composite/dialog|g' \
  -e 's|@/components/ui/sheet|@/components/composite/sheet|g' \
  -e 's|@/components/ui/popover|@/components/composite/popover|g' \
  -e 's|@/components/ui/dropdown-menu|@/components/composite/dropdown-menu|g' \
  -e 's|@/components/ui/keyboard-shortcut|@/components/composite/keyboard-shortcut|g' \
  -e 's|@/components/LoadingButton|@/components/composite/LoadingButton|g' \
  -e 's|@/components/magicui/shimmer-button|@/components/composite/shimmer-button|g'

# Layout components
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
  -e 's|@/components/ui/aspect-ratio|@/components/layout/aspect-ratio|g' \
  -e 's|@/components/ui/divider|@/components/layout/divider|g' \
  -e 's|@/components/ui/separator|@/components/layout/separator|g' \
  -e 's|@/components/ui/scroll-area|@/components/layout/scroll-area|g' \
  -e 's|@/components/ui/sidebar|@/components/layout/sidebar|g' \
  -e 's|@/components/ui/sidebar-utils|@/components/layout/sidebar-utils|g' \
  -e 's|@/components/ui/breadcrumb|@/components/layout/breadcrumb|g' \
  -e 's|@/components/settings/SettingsLayout|@/components/layout/SettingsLayout|g' \
  -e 's|@/components/utils/error-boundaries|@/components/layout/error-boundaries|g'

# Icon components
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
  -e 's|@/components/svg/circle-svg|@/components/icons/circle-svg|g' \
  -e 's|@/components/svg/dot-pattern|@/components/icons/dot-pattern|g' \
  -e 's|@/components/svg/logo-svg|@/components/icons/logo-svg|g'

# Feedback components
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
  -e 's|@/components/ui/alert|@/components/feedback/alert|g' \
  -e 's|@/components/ui/alert-dialog|@/components/feedback/alert-dialog|g' \
  -e 's|@/components/ui/progress|@/components/feedback/progress|g' \
  -e 's|@/components/ui/spinner|@/components/feedback/spinner|g' \
  -e 's|@/components/ui/loader|@/components/feedback/loader|g' \
  -e 's|@/components/ui/sonner|@/components/feedback/sonner|g' \
  -e 's|@/components/ui/skeleton|@/components/feedback/skeleton|g' \
  -e 's|@/components/ui/use-toast|@/components/feedback/use-toast|g'

# Data display components
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
  -e 's|@/components/ui/table|@/components/data-display/table|g' \
  -e 's|@/components/ui/typography|@/components/data-display/typography|g' \
  -e 's|@/components/ui/avatar|@/components/data-display/avatar|g' \
  -e 's|@/components/ui/badge|@/components/data-display/badge|g' \
  -e 's|@/components/ui/card|@/components/data-display/card|g' \
  -e 's|@/components/ui/chart|@/components/data-display/chart|g' \
  -e 's|@/components/ui/accordion|@/components/data-display/accordion|g' \
  -e 's|@/components/ui/collapsible|@/components/data-display/collapsible|g' \
  -e 's|@/components/ui/tabs|@/components/data-display/tabs|g' \
  -e 's|@/components/ui/calendar|@/components/data-display/calendar|g' \
  -e 's|@/components/ui/bentoo|@/components/data-display/bentoo|g' \
  -e 's|@/components/FollowerCount|@/components/data-display/FollowerCount|g' \
  -e 's|@/components/Linkify|@/components/data-display/Linkify|g' \
  -e 's|@/components/InfiniteScrollContainer|@/components/data-display/InfiniteScrollContainer|g' \
  -e 's|@/components/utils/tailwind-indicator|@/components/data-display/tailwind-indicator|g'

echo "Import paths have been updated!"
