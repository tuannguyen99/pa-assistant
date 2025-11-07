# Testing Strategy

## Unit Tests (Vitest)

```	ypescript
// src/lib/scoring/calculator.test.ts
import { describe, it, expect } from 'vitest'
import { calculateScore } from './calculator'

describe('Score Calculator', () => {
  it('calculates score correctly', () => {
    const result = calculateScore({
      weight: 30,
      difficulty: 'L2', // 2x multiplier
      rating: 4
    })
    expect(result).toBe(240) // 30 * 2 * 4
  })
})
```

## Integration Tests

```	ypescript
// tests/integration/api/reviews.test.ts
describe('Review API', () => {
  it('creates review successfully', async () => {
    const response = await fetch('/api/reviews', {
      method: 'POST',
      body: JSON.stringify({ /* data */ })
    })
    expect(response.status).toBe(201)
  })
})
```

## E2E Tests (Playwright)

```	ypescript
// tests/e2e/target-setting.spec.ts
test('employee can create targets', async ({ page }) => {
  await page.goto('/targets/new')
  await page.fill('[name="taskDescription"]', 'Improve system performance')
  await page.fill('[name="kpi"]', 'Reduce load time by 30%')
  await page.selectOption('[name="difficulty"]', 'L2')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/targets\/\[id\]/)
})
```

---
