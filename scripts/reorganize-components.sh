#!/bin/bash

cd "$(dirname "$0")/.."

echo "Creating new component directories..."
mkdir -p src/components/{core,composite,layout,icons,feedback,data-display}

echo "Moving core components..."
mv src/components/ui/{button,input,textarea,select,checkbox,switch,toggle,label,form}.tsx src/components/core/
mv src/components/ui/visually-hidden.tsx src/components/core/
mv src/components/PasswordInput.tsx src/components/core/

echo "Moving composite components..."
mv src/components/{CropImageDialog,FollowButton,UserAvatar,UserLinkWithTooltip,UserTooltip,LoadingButton}.tsx src/components/composite/
mv src/components/ui/{multi-select,command,dialog,sheet,popover,dropdown-menu,keyboard-shortcut}.tsx src/components/composite/
mv src/components/magicui/shimmer-button.tsx src/components/composite/
mv src/components/comments src/components/composite/

echo "Moving layout components..."
mv src/components/ui/{aspect-ratio,divider,separator,scroll-area,sidebar,sidebar-utils,breadcrumb}.tsx src/components/layout/
mv src/components/settings/SettingsLayout.tsx src/components/layout/
mv src/components/utils/error-boundaries.tsx src/components/layout/

echo "Moving icon components..."
mv src/components/svg/* src/components/icons/

echo "Moving feedback components..."
mv src/components/ui/{alert,alert-dialog,progress,spinner,loader,sonner,skeleton}.tsx src/components/feedback/
mv src/components/ui/use-toast.ts src/components/feedback/

echo "Moving data display components..."
mv src/components/ui/{table,typography,avatar,badge,card,chart,accordion,collapsible,tabs,calendar,bentoo}.tsx src/components/data-display/
mv src/components/{FollowerCount,Linkify,InfiniteScrollContainer}.tsx src/components/data-display/
mv src/components/utils/tailwind-indicator.tsx src/components/data-display/

echo "Cleaning up empty directories..."
rm -rf src/components/{svg,magicui,settings,utils,ui}

echo "Done! Components have been reorganized."
