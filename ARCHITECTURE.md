# Product AI — Architecture & CI/CD Improvements

## Summary of Changes

This document outlines the architectural improvements and CI/CD pipeline implemented to ensure code quality, security, and automated deployment.

### 1. Security: Gemini API Proxy

**Problem:** The Gemini API key was being used directly from the frontend, exposing it to potential extraction via browser DevTools.

**Solution:** Created a **Vercel Edge Function** at `api/gemini.ts` that:
- Runs server-side, never exposing the API key to the browser
- Handles CORS for secure cross-origin requests
- Validates and sanitizes requests before forwarding to Google Gemini API
- Returns consistent error responses

**Migration:** Update `services/geminiService.ts` to call `/api/gemini` instead of directly calling Google Gemini API.

```typescript
// Before (insecure):
const client = new GoogleGenAI(apiKey); // apiKey exposed to browser

// After (secure):
const response = await fetch('/api/gemini', {
  method: 'POST',
  body: JSON.stringify({ prompt, model, temperature, maxTokens })
});
```

**Environment Setup:**
```bash
# .env.local (frontend)
VITE_GEMINI_API_KEY= # No longer needed!

# Vercel environment variable (deploy settings)
GEMINI_API_KEY=your-key-here
```

---

### 2. CI/CD Pipeline with GitHub Actions

**File:** `.github/workflows/ci.yml`

The pipeline runs on every push and pull request:

1. **Type Check** — `npm run type-check` (tsc --noEmit)
   - Catches TypeScript errors before build
   - No runtime overhead, fast feedback

2. **Lint** — `npm run lint` (ESLint)
   - Code style consistency
   - Detects potential bugs (unused variables, implicit `any`, etc.)

3. **Test** — `npm run test` (Vitest)
   - Unit tests for services and components
   - Coverage reports uploaded to Codecov

4. **Build** — `npm run build`
   - Verifies production build succeeds
   - Vite optimizations applied

5. **Deploy (Preview)** — On pull requests
   - Automatic Vercel preview deployment
   - Comment with preview URL appears on PR

6. **Deploy (Production)** — On merge to main
   - Automatic production deployment
   - Available at your Vercel domain

### GitHub Secrets Required

For CI/CD to work, configure these in GitHub repo Settings → Secrets:
- `VERCEL_TOKEN` — Personal access token from Vercel
- `VERCEL_ORG_ID` — Team ID from Vercel
- `VERCEL_PROJECT_ID` — Project ID from Vercel

[Guide: Vercel + GitHub Actions Setup](https://vercel.com/docs/concepts/deployments/git/vercel-for-github)

---

### 3. TypeScript Strict Mode

**File:** `tsconfig.json`

Upgraded to `strict: true` and additional checks:
- `noUncheckedIndexedAccess` — Prevent undefined array access
- `exactOptionalPropertyTypes` — Strict optional property handling
- `noPropertyAccessFromIndexSignature` — Safer object property access

**Impact:** Requires type annotations for all function parameters and return values. Catches bugs at compile time.

**Example fix:**
```typescript
// Before (implicit any)
const handleData = (data) => { ... }

// After (explicit type)
const handleData = (data: unknown) => { ... }
```

---

### 4. Error Handling

**File:** `services/errorHandler.ts`

Provides:
- `APIError`, `GeminiError`, `ValidationError` — Typed error classes
- `handleFetchError()` — Parse HTTP responses into typed errors
- `getUserFriendlyMessage()` — Convert errors to user-facing messages
- `withErrorHandling()` — Wrap functions with try-catch

**Usage:**
```typescript
import { withErrorHandling, handleFetchError } from './services/errorHandler';

const callGemini = withErrorHandling(async (prompt: string) => {
  const response = await fetch('/api/gemini', { method: 'POST', body: JSON.stringify({ prompt }) });
  if (!response.ok) {
    throw await handleFetchError(response);
  }
  return response.json();
});

// Caller handles typed errors
try {
  const result = await callGemini('my prompt');
} catch (error) {
  if (error instanceof GeminiError) {
    showErrorToUser(error.message);
  }
}
```

---

### 5. Testing Infrastructure

**Files:**
- `vitest.config.ts` — Vitest configuration
- `.eslintrc.json` — Linting rules

**Commands:**
```bash
npm run test                # Run tests once
npm run test:ui           # Interactive test UI
npm run test:coverage     # Coverage report
```

**Testing stack:**
- **Vitest** — Fast unit testing (Vite-native)
- **React Testing Library** — Component testing
- **MSW (Mock Service Worker)** — Mock API calls

**Example test:**
```typescript
// services/errorHandler.test.ts
import { describe, it, expect } from 'vitest';
import { APIError, getUserFriendlyMessage } from './errorHandler';

describe('getUserFriendlyMessage', () => {
  it('should return friendly message for rate limit', () => {
    const error = new APIError(429, 'Rate limited', 'GEMINI_RATE_LIMIT');
    expect(getUserFriendlyMessage(error)).toBe('Too many requests. Please try again in a moment.');
  });
});
```

---

### 6. Linting

**File:** `.eslintrc.json`

Configured rules:
- `@typescript-eslint/no-unused-vars` — Error on unused variables
- `@typescript-eslint/no-explicit-any` — Warn on `any` type
- `@typescript-eslint/explicit-function-return-types` — Require return type annotations
- `react/react-in-jsx-scope` — Off (React 17+ JSX transform)
- `no-console` — Warn on `console.log` (except `warn`, `error`)

**Run locally:**
```bash
npm run lint           # Check
npm run lint:fix      # Auto-fix issues
```

---

## Implementation Checklist

### Phase 1: Infrastructure (Done)
- [x] Update `package.json` with scripts and dependencies
- [x] Upgrade `tsconfig.json` to strict mode
- [x] Create `.github/workflows/ci.yml`
- [x] Create `api/gemini.ts` (Vercel proxy)
- [x] Create `services/errorHandler.ts`
- [x] Create `.eslintrc.json`
- [x] Create `vitest.config.ts`

### Phase 2: Integration (Next)
- [ ] Modify `services/geminiService.ts` to use `/api/gemini` proxy
- [ ] Update components to handle typed errors from `errorHandler`
- [ ] Add test files for critical services and components
- [ ] Configure Vercel secrets (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID)
- [ ] Push to GitHub and verify CI/CD runs

### Phase 3: Testing & Polish (Later)
- [ ] Write unit tests for all services
- [ ] Write integration tests for critical user flows
- [ ] Achieve 80%+ code coverage
- [ ] Document API proxy endpoint

---

## Local Development

### Setup
```bash
cd C:\Users\augusto\product-ai
npm install
npm run dev
```

Visits `localhost:3000` in your browser.

### Pre-commit Checklist
Before pushing, run locally:
```bash
npm run type-check    # TypeScript errors?
npm run lint          # Linting errors?
npm run test -- --run # Tests passing?
npm run build         # Build succeeds?
```

Or all at once:
```bash
npm run type-check && npm run lint && npm run test -- --run && npm run build
```

### Push & Deploy
```bash
git add .
git commit -m "feat: implement architecture improvements"
git push origin main
```

GitHub Actions will:
1. Run the full CI pipeline
2. If all pass → Vercel deploys to production
3. If any fail → Block merge, fix errors, retry

---

## Environment Variables

### Frontend (.env.local)
```env
# No longer needed — use Vercel proxy instead
# VITE_GEMINI_API_KEY=
```

### Vercel Deploy Settings
Configure in Vercel dashboard:
```
GEMINI_API_KEY=sk-...
ALLOWED_ORIGIN=https://yourdomain.com
```

---

## Monitoring

### GitHub Actions
- Dashboard: https://github.com/AugustoFiorella/Product-AI-SUGUS/actions
- Each commit shows: Type Check, Lint, Test, Build status
- PR comments with deploy preview URL

### Vercel Deployments
- Dashboard: https://vercel.com/dashboard
- View logs, rollback, inspect edge function performance
- Environment variable management

### Codecov (Optional)
- Configure in Vercel to track coverage trends
- Comment coverage reports on PRs

---

## Next Steps

1. **Install dependencies** locally:
   ```bash
   npm install
   ```

2. **Create `services/geminiService.ts`** to use the proxy:
   - Call `/api/gemini` instead of Google API directly
   - Remove direct dependency on `@google/genai`

3. **Add error handling** to components:
   - Import `getUserFriendlyMessage` from `errorHandler`
   - Wrap API calls with try-catch

4. **Write first test** (example):
   ```bash
   npm run test:ui  # Opens Vitest UI
   ```

5. **Push to GitHub**:
   - GitHub Actions runs automatically
   - Fix any failures
   - Merge and deploy

---

## Questions?

Refer to:
- CLAUDE.md — Project context and conventions
- .github/workflows/ci.yml — Pipeline definition
- api/gemini.ts — Proxy implementation
- services/errorHandler.ts — Error types and utilities
