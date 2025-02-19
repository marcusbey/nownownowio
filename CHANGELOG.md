# 2025-02-19

## API Endpoint Centralization

### Added
- New centralized API endpoints in `apiEndpoints.ts`:
  - Auth endpoints (providers, session, etc.)
  - Post-related endpoints (views, likes, bookmarks, comments)

### Changed
- Updated components to use centralized endpoints:
  - `SignInProviders`: Now uses `AUTH_PROVIDERS` endpoint
  - `Comments`: Now uses `POST_COMMENTS` endpoint
  - `PostViews`: Now uses `POST_VIEWS` endpoint
  - `PostService`: Now uses centralized endpoints for post actions

### Technical Details
- Improved type safety with TypeScript endpoint definitions
- Reduced code duplication across components
- Easier maintenance with single source of truth for API endpoints

# 2025-02-17

## Component Architecture Refactoring

### Added
- New component directory structure:
  - `/core`: Base UI components (button, input, form, etc.)
  - `/composite`: Complex components (dialogs, user interactions, etc.)
  - `/layout`: Layout components (sidebar, divider, etc.)
  - `/icons`: SVG and icon components
  - `/feedback`: Notification components (alerts, toasts, etc.)
  - `/data-display`: Data visualization components (tables, charts, etc.)

### Changed
- Moved all UI components from `/components/ui` to their respective categories
- Reorganized utility components into appropriate categories
- Updated all import paths across the codebase to reflect new structure
- Consolidated duplicate components

### Removed
- Deprecated `/components/ui` directory
- Removed `/components/utils` directory
- Removed `/components/svg` directory
- Removed `/components/magicui` directory
- Removed `/components/settings` directory
- Cleaned up duplicate component files at root level

# 2024-09-12

- Add `NEXT_PUBLIC_EMAIL_CONTACT` env variable
- Add `RESEND_EMAIL_FROM` env variable

# 2024-09-08

- Add `slug` to organizations
- Update URL with `slug` instead of `id`

# 2024-09-01

- Update NOW.TS to version 2 with organizations
