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
