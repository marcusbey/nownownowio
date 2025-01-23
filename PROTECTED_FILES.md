# Protected Files

The following files are protected from accidental modifications:

## Core System Files
- `src/lib/prisma/prisma.user.extends.ts`: Core Prisma user extensions
- `src/lib/auth/auth-config-setup.ts`: Authentication configuration
- `app/orgs/[orgSlug]/(navigation)/settings/subscription/Plans.tsx`: Subscription plans
- `src/features/contact/support/contact-support.action.ts`: Support system actions

## Modifying Protected Files

If you need to modify these files:

1. Contact the team lead or project owner
2. Create a dedicated branch for the changes
3. Get explicit approval through code review
4. Document the reasons for modification
5. Update tests and documentation

## Adding New Protected Files

To add new files to the protection list:

1. Update `.gitattributes`
2. Update the pre-commit hook in `.husky/pre-commit`
3. Document the file in this document

## Rationale

These files are protected because:
- They contain critical business logic
- They have complex dependencies
- Changes can have wide-ranging effects
- They require careful testing and validation
