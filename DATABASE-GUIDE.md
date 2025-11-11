# Database Management Guide

This guide explains how to manage separate databases for development and testing.

## Database Structure

- **Development Database**: `prisma/dev.db` - Used for manual testing and development
- **Test Database**: `prisma/test.db` - Used for automated E2E tests

## Environment Files

- `.env` - Base environment variables
- `.env.local` - Development overrides (takes precedence)
- `.env.test` - Test environment variables

## Commands

### Development Database

```bash
# Start development server (uses dev.db)
npm run dev

# Seed development database with HR Admin only
npm run db:seed

# Clean up development database (keep only HR Admin)
npm run db:cleanup

# Reset development database
npm run db:reset
```

### Test Database

```bash
# Run E2E tests (automatically sets up test.db)
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Manual test database setup
NODE_ENV=test npm run db:seed:test
```

### Database Migration

```bash
# Create and apply migrations to development database
npm run db:migrate

# Apply migrations to test database
NODE_ENV=test npx prisma migrate deploy
```

## Database Separation Benefits

1. **Isolation**: Test data doesn't interfere with development data
2. **Consistency**: Tests always run against a known clean state
3. **Performance**: Tests don't slow down development database
4. **Safety**: Development data is protected from test operations

## Current Test Users

The test database is seeded with these users:

- **HR Admin**: `hradmin.target@example.com` / `HRAdmin@123`
- **Manager**: `manager.target@example.com` / `Manager@123`
- **Employee**: `employee.target@example.com` / `Employee@123`

## Troubleshooting

### Test Database Issues

If tests fail due to database issues:

```bash
# Clean and recreate test database
rm prisma/test.db
npm run test:e2e
```

### Development Database Issues

If development database has issues:

```bash
# Reset development database
npm run db:reset

# Or manually clean it
npm run db:cleanup
npm run db:seed
```

### Environment Variable Issues

Make sure the correct `.env` files are loaded:

- Development: `.env.local` takes precedence
- Testing: `.env.test` is used automatically by Playwright setup