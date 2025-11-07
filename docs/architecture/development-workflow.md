# Development Workflow

## Getting Started

```ash
# Clone repository
git clone https://github.com/your-org/pa-assistant
cd pa-assistant

# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma migrate dev

# Seed initial data
npm run seed

# Start development server
npm run dev

# Open http://localhost:3000
```

## Development Commands

```ash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npm run type-check   # TypeScript check
npm run test         # Unit tests (Vitest)
npm run test:e2e     # E2E tests (Playwright)
npm run prisma:studio # Database GUI
```

## Environment Configuration

**Environment Variables Structure:**

```bash
# .env.local (Development)
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-min-32-chars"

# AI Configuration
AI_MODE="local"                          # "web" | "local"
OLLAMA_API_URL="http://localhost:11434"
OLLAMA_MODEL="llama2"

# Optional: LDAP (Future)
LDAP_URL=""
LDAP_BIND_DN=""
LDAP_BIND_PASSWORD=""

# Logging
LOG_LEVEL="debug"                        # "debug" | "info" | "warn" | "error"
LOG_FILE_PATH="./logs/app.log"

# Feature Flags
FEATURE_AI_ASSISTANCE="true"
FEATURE_DELEGATION="true"
```

```bash
# .env.production (Production)
# Database
DATABASE_URL="postgresql://user:password@host:5432/pa_assistant"

# NextAuth.js
NEXTAUTH_URL="https://pa-assistant.company.com"
NEXTAUTH_SECRET="production-secret-key-min-32-chars"

# AI Configuration
AI_MODE="local"
OLLAMA_API_URL="http://ollama-service:11434"
OLLAMA_MODEL="llama2"

# LDAP
LDAP_URL="ldap://ldap.company.com:389"
LDAP_BIND_DN="cn=admin,dc=company,dc=com"
LDAP_BIND_PASSWORD="encrypted-password"

# Logging
LOG_LEVEL="info"
LOG_FILE_PATH="/var/log/pa-assistant/app.log"

# Feature Flags
FEATURE_AI_ASSISTANCE="true"
FEATURE_DELEGATION="true"
```

**Environment Variable Validation:**

```typescript
// src/lib/config/env.ts
import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1),

  // NextAuth
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),

  // AI
  AI_MODE: z.enum(['web', 'local']).default('local'),
  OLLAMA_API_URL: z.string().url().optional(),
  OLLAMA_MODEL: z.string().default('llama2'),

  // LDAP (Optional)
  LDAP_URL: z.string().url().optional(),
  LDAP_BIND_DN: z.string().optional(),
  LDAP_BIND_PASSWORD: z.string().optional(),

  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  LOG_FILE_PATH: z.string().default('./logs/app.log'),

  // Feature Flags
  FEATURE_AI_ASSISTANCE: z.string().transform(val => val === 'true').default('true'),
  FEATURE_DELEGATION: z.string().transform(val => val === 'true').default('true')
})

export type Env = z.infer<typeof envSchema>

export const env = envSchema.parse(process.env)
```

**Usage in Application:**

```typescript
// src/lib/ai/ai-service.ts
import { env } from '@/lib/config/env'

export class AIService {
  async generateSuggestion(context: string): Promise<string> {
    if (env.AI_MODE === 'local') {
      const response = await fetch(`${env.OLLAMA_API_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: env.OLLAMA_MODEL,
          prompt: context
        })
      })
      return response.json()
    } else {
      // Web mode: Return prompt for user to copy
      return this.generateWebPrompt(context)
    }
  }
}
```

**Configuration Per Environment:**

| Variable | Development | Production | Notes |
|----------|-------------|------------|-------|
| DATABASE_URL | SQLite (file) | PostgreSQL | Prisma handles migration |
| AI_MODE | local | local | Can switch to web if needed |
| LOG_LEVEL | debug | info | More verbose in dev |
| NEXTAUTH_SECRET | Random dev key | Secure prod key | Min 32 chars |
| Feature Flags | true | Controlled | Easy A/B testing |

---

## Testing Strategy

**Testing Pyramid:**

```
        /\
       /  \
      /E2E \           ← 10% - Critical user flows
     /──────\
    /        \
   / Integr.  \        ← 20% - API + DB interactions
  /────────────\
 /              \
/  Unit Tests    \     ← 70% - Business logic, utilities
──────────────────
```

**Test Coverage Targets:**

| Layer | Coverage | Tools | Focus |
|-------|----------|-------|-------|
| **Unit Tests** | 80%+ | Vitest + Testing Library | Business logic, validation, utilities |
| **Integration Tests** | 60%+ | Vitest + Prisma Mock | API routes, service layer |
| **E2E Tests** | Critical paths | Playwright | User workflows |

**Testing Tools:**

```json
// package.json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "playwright": "^1.40.0",
    "@playwright/test": "^1.40.0",
    "prisma": "^5.0.0",
    "jest-mock-extended": "^3.0.0"
  }
}
```

**Test Configuration:**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.{js,ts}',
        '**/types.ts'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }
})
```

---

## Test Organization

**Directory Structure:**

```
tests/
├── setup.ts                      # Vitest global setup
├── mocks/
│   ├── prisma.ts                 # Prisma client mock
│   ├── next-auth.ts              # NextAuth mock
│   └── handlers.ts               # MSW handlers
│
├── unit/                         # Unit tests (70%)
│   ├── lib/
│   │   ├── validation/
│   │   │   ├── target-schemas.test.ts
│   │   │   └── review-schemas.test.ts
│   │   │
│   │   ├── workflows/
│   │   │   ├── review-state-machine.test.ts
│   │   │   └── score-calculator.test.ts
│   │   │
│   │   └── auth/
│   │       └── rbac.test.ts
│   │
│   └── components/
│       ├── auth/
│       │   ├── login-form.test.tsx
│       │   └── role-header.test.tsx
│       │
│       ├── reviews/
│       │   ├── review-workflow.test.tsx
│       │   └── self-evaluation-tab.test.tsx
│       │
│       └── targets/
│           └── target-setting-form.test.tsx
│
├── integration/                  # Integration tests (20%)
│   ├── api/
│   │   ├── auth/
│   │   │   └── login.test.ts
│   │   │
│   │   ├── reviews/
│   │   │   ├── get-reviews.test.ts
│   │   │   ├── create-review.test.ts
│   │   │   └── submit-review.test.ts
│   │   │
│   │   └── targets/
│   │       ├── create-target-set.test.ts
│   │       └── approve-target-set.test.ts
│   │
│   └── services/
│       ├── auth-service.test.ts
│       ├── ai-service.test.ts
│       └── audit-logger.test.ts
│
└── e2e/                          # E2E tests (10%)
    ├── auth.spec.ts              # Login/logout flows
    ├── target-setting.spec.ts    # Complete target setting workflow
    ├── self-evaluation.spec.ts   # Employee self-evaluation flow
    ├── manager-review.spec.ts    # Manager evaluation flow
    ├── role-switching.spec.ts    # Multi-role user scenarios
    └── hr-consolidation.spec.ts  # HR admin workflows
```

---

## Test Examples

**1. Unit Test: Validation Schema**

```typescript
// tests/unit/lib/validation/target-schemas.test.ts
import { describe, it, expect } from 'vitest'
import { TargetSetSchema } from '@/lib/validation/target-schemas'

describe('TargetSetSchema', () => {
  it('validates a valid target set', () => {
    const validData = {
      targets: [
        {
          taskDescription: 'Complete project X',
          kpi: 'On-time delivery',
          weight: 50,
          difficulty: 'L2'
        },
        {
          taskDescription: 'Improve code quality',
          kpi: 'Code review score > 8',
          weight: 30,
          difficulty: 'L1'
        },
        {
          taskDescription: 'Mentor junior developers',
          kpi: '2 successful mentees',
          weight: 20,
          difficulty: 'L2'
        }
      ]
    }

    const result = TargetSetSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('rejects target set with incorrect total weight', () => {
    const invalidData = {
      targets: [
        {
          taskDescription: 'Task 1',
          kpi: 'KPI 1',
          weight: 60,
          difficulty: 'L1'
        },
        {
          taskDescription: 'Task 2',
          kpi: 'KPI 2',
          weight: 30,
          difficulty: 'L2'
        }
      ]
    }

    const result = TargetSetSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Total weight must equal 100%')
    }
  })

  it('requires 3-5 targets', () => {
    const tooFewTargets = { targets: [] }
    const tooManyTargets = {
      targets: Array(6).fill({
        taskDescription: 'Task',
        kpi: 'KPI',
        weight: 16.67,
        difficulty: 'L1'
      })
    }

    expect(TargetSetSchema.safeParse(tooFewTargets).success).toBe(false)
    expect(TargetSetSchema.safeParse(tooManyTargets).success).toBe(false)
  })
})
```

**2. Unit Test: React Component**

```typescript
// tests/unit/components/auth/login-form.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '@/components/auth/login-form'
import { signIn } from 'next-auth/react'

vi.mock('next-auth/react', () => ({
  signIn: vi.fn()
}))

describe('LoginForm', () => {
  it('renders login form fields', () => {
    render(<LoginForm />)

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid credentials', async () => {
    const user = userEvent.setup()
    const mockSignIn = vi.mocked(signIn)
    mockSignIn.mockResolvedValue({ ok: true, error: null })

    render(<LoginForm />)

    await user.type(screen.getByLabelText(/username/i), 'alice')
    await user.type(screen.getByLabelText(/password/i), 'Password123!')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        username: 'alice',
        password: 'Password123!',
        redirect: false
      })
    })
  })

  it('displays error message on failed login', async () => {
    const user = userEvent.setup()
    const mockSignIn = vi.mocked(signIn)
    mockSignIn.mockResolvedValue({ ok: false, error: 'Invalid credentials' })

    render(<LoginForm />)

    await user.type(screen.getByLabelText(/username/i), 'alice')
    await user.type(screen.getByLabelText(/password/i), 'wrong-password')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })
})
```

**3. Integration Test: API Route**

```typescript
// tests/integration/api/reviews/submit-review.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { POST } from '@/app/api/reviews/[id]/submit/route'
import { prismaMock } from '@/tests/mocks/prisma'
import { getServerSession } from 'next-auth'

vi.mock('next-auth', () => ({
  getServerSession: vi.fn()
}))

describe('POST /api/reviews/:id/submit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('submits review successfully', async () => {
    const mockSession = {
      user: { id: 'user-1', email: 'alice@company.com', roles: ['employee'] }
    }
    vi.mocked(getServerSession).mockResolvedValue(mockSession)

    const mockReview = {
      id: 'review-1',
      revieweeId: 'user-1',
      status: 'self_eval_draft',
      employeeTargets: [
        {
          id: 'target-1',
          employeeRating: 4,
          resultExplanation: 'Completed all tasks successfully'
        }
      ]
    }

    prismaMock.review.findUnique.mockResolvedValue(mockReview)
    prismaMock.review.update.mockResolvedValue({
      ...mockReview,
      status: 'self_eval_submitted',
      employeeSubmittedAt: new Date()
    })

    const request = new Request('http://localhost:3000/api/reviews/review-1/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeTargets: mockReview.employeeTargets
      })
    })

    const response = await POST(request, { params: { id: 'review-1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.status).toBe('self_eval_submitted')
    expect(prismaMock.review.update).toHaveBeenCalledWith({
      where: { id: 'review-1' },
      data: {
        employeeTargets: mockReview.employeeTargets,
        status: 'self_eval_submitted',
        employeeSubmittedAt: expect.any(Date)
      }
    })
  })

  it('rejects submission with invalid state transition', async () => {
    const mockSession = {
      user: { id: 'user-1', email: 'alice@company.com', roles: ['employee'] }
    }
    vi.mocked(getServerSession).mockResolvedValue(mockSession)

    const mockReview = {
      id: 'review-1',
      revieweeId: 'user-1',
      status: 'archived', // Invalid state for submission
      employeeTargets: []
    }

    prismaMock.review.findUnique.mockResolvedValue(mockReview)

    const request = new Request('http://localhost:3000/api/reviews/review-1/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeTargets: [] })
    })

    const response = await POST(request, { params: { id: 'review-1' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('INVALID_STATE_TRANSITION')
  })

  it('enforces authorization', async () => {
    const mockSession = {
      user: { id: 'user-2', email: 'bob@company.com', roles: ['employee'] }
    }
    vi.mocked(getServerSession).mockResolvedValue(mockSession)

    const mockReview = {
      id: 'review-1',
      revieweeId: 'user-1', // Different user
      status: 'self_eval_draft',
      employeeTargets: []
    }

    prismaMock.review.findUnique.mockResolvedValue(mockReview)

    const request = new Request('http://localhost:3000/api/reviews/review-1/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeTargets: [] })
    })

    const response = await POST(request, { params: { id: 'review-1' } })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('FORBIDDEN')
  })
})
```

**4. E2E Test: Complete Workflow**

```typescript
// tests/e2e/self-evaluation.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Self-Evaluation Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as employee
    await page.goto('/login')
    await page.fill('input[name="username"]', 'alice')
    await page.fill('input[name="password"]', 'Password123!')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/dashboard/employee')
  })

  test('complete self-evaluation flow', async ({ page }) => {
    // Navigate to review
    await page.click('text=My Review')
    await expect(page).toHaveURL(/\/reviews\//)

    // Verify review is in draft state
    await expect(page.locator('[data-testid="review-status"]')).toHaveText('Draft')

    // Rate first target
    await page.locator('[data-testid="target-0-rating"]').click()
    await page.locator('[data-value="4"]').click()

    // Write explanation with AI assistance
    await page.fill(
      '[data-testid="target-0-explanation"]',
      'Completed all project milestones on time. Delivered high-quality code with 95% test coverage.'
    )

    // Click AI Help button
    await page.click('[data-testid="target-0-ai-help"]')

    // Wait for AI modal
    await expect(page.locator('[data-testid="ai-modal"]')).toBeVisible()

    // Verify AI suggestion appears
    await expect(page.locator('[data-testid="ai-suggestion"]')).not.toBeEmpty()

    // Accept AI suggestion
    await page.click('[data-testid="ai-accept"]')

    // Verify explanation updated
    await expect(page.locator('[data-testid="target-0-explanation"]')).not.toHaveValue(
      'Completed all project milestones on time. Delivered high-quality code with 95% test coverage.'
    )

    // Rate remaining targets
    await page.locator('[data-testid="target-1-rating"]').click()
    await page.locator('[data-value="5"]').click()
    await page.fill(
      '[data-testid="target-1-explanation"]',
      'Exceeded expectations by implementing additional features.'
    )

    await page.locator('[data-testid="target-2-rating"]').click()
    await page.locator('[data-value="3"]').click()
    await page.fill(
      '[data-testid="target-2-explanation"]',
      'Made progress but did not fully achieve the target due to dependencies.'
    )

    // Fill career section
    await page.fill('[name="currentJobDescription"]', 'Senior Software Engineer...')
    await page.fill('[name="careerPath"]', 'Aiming for Tech Lead position...')

    // Submit review
    await page.click('button[type="submit"]')

    // Verify success
    await expect(page.locator('.toast')).toContainText('Review submitted successfully')
    await expect(page.locator('[data-testid="review-status"]')).toHaveText('Submitted')

    // Verify read-only after submission
    await expect(page.locator('[data-testid="target-0-rating"]')).toBeDisabled()
    await expect(page.locator('[data-testid="target-0-explanation"]')).toBeDisabled()
  })

  test('validates incomplete submission', async ({ page }) => {
    await page.click('text=My Review')

    // Try to submit without rating all targets
    await page.locator('[data-testid="target-0-rating"]').click()
    await page.locator('[data-value="4"]').click()
    await page.fill('[data-testid="target-0-explanation"]', 'Explanation...')

    // Leave other targets unrated
    await page.click('button[type="submit"]')

    // Verify validation error
    await expect(page.locator('.toast')).toContainText('Please rate all targets')
    await expect(page.locator('[data-testid="review-status"]')).toHaveText('Draft')
  })

  test('supports auto-save', async ({ page }) => {
    await page.click('text=My Review')

    // Enter data
    await page.locator('[data-testid="target-0-rating"]').click()
    await page.locator('[data-value="4"]').click()
    await page.fill('[data-testid="target-0-explanation"]', 'Auto-save test...')

    // Wait for auto-save indicator
    await expect(page.locator('[data-testid="auto-save-indicator"]')).toHaveText('Saved')

    // Reload page
    await page.reload()

    // Verify data persisted
    await expect(page.locator('[data-testid="target-0-rating"]')).toHaveValue('4')
    await expect(page.locator('[data-testid="target-0-explanation"]')).toHaveValue(
      'Auto-save test...'
    )
  })
})
```

**5. Mock Setup**

```typescript
// tests/mocks/prisma.ts
import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'

export const prismaMock = mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>

beforeEach(() => {
  mockReset(prismaMock)
})
```

```typescript
// tests/setup.ts
import { beforeAll, afterEach, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn()
  }),
  usePathname: () => '/test-path',
  useSearchParams: () => new URLSearchParams()
}))

// Mock NextAuth
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: { id: 'test-user', email: 'test@example.com', roles: ['employee'] }
    },
    status: 'authenticated'
  }),
  signIn: vi.fn(),
  signOut: vi.fn()
}))
```

**Test Execution:**

```bash
# Run all tests
npm test

# Run unit tests only
npm test -- tests/unit

# Run integration tests
npm test -- tests/integration

# Run E2E tests
npm run test:e2e

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- target-schemas.test.ts

# Watch mode
npm test -- --watch

# UI mode (Vitest)
npm test -- --ui
```

**CI/CD Integration:**

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm test -- --coverage
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---
