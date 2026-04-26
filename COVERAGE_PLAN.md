# Coverage Boost Plan - Target 80%+ Lines

## Current Status (2026-04-23)
- **Statements**: 61.39% (334/544)
- **Lines**: 62.23% (318/511)

## Files to Cover

### 1. src/utils/storage.ts (Priority 1 - Easy)
**Tests needed**: 10
**Scenarios**:
- set() string → localStorage.setItem
- set() object → JSON.stringify + setItem
- get() raw string → returns as-is
- get() JSON string → JSON.parse → returns object
- get() invalid JSON → fallback null
- remove() → removeItem called
- clear() → clear called
- authStorage: getAccessToken, setTokens, clearTokens, hasTokens

**Mock**: vi.spyOn(window.localStorage, 'setItem'...)  
**File**: src/utils/__tests__/storage.test.ts  
**Expected gain**: utils 39% → ~65%

---

### 2. src/api/client.ts (Priority 2 - Highest impact)
**Tests needed**: 12
**Scenarios**:
- Request interceptor: adds Authorization header when token exists
- Request interceptor: skips Content-Type for FormData
- Response 401: clears session, throws AppError
- Response 403: throws AppError "Forbidden"
- Response 500+: throws AppError "Server error"
- Response success: returns response.data
- refreshAccessToken() success: saves tokens
- refreshAccessToken() fail: returns null
- get(), post(), put(), patch(), del() methods

**Mock**: vi.mock('@/features/auth/store') + mock localStorage  
**File**: src/api/__tests__/client.test.ts  
**Expected gain**: api 27% → ~60%

---

### 3. src/features/auth/api.ts (Priority 3)
**Tests needed**: 8
**Scenarios**:
- login() success → returns user data
- login() fail → throws error
- register() success
- logout() calls client

**Mock**: vi.mock('@/api/client')  
**File**: src/features/auth/__tests__/api.test.ts  
**Expected gain**: auth 68% → ~80%

---

### 4. src/components/features/Chatbot.tsx (Priority 4 - Minor)
**Tests to add**: 3
**Scenarios**:
- scrollTo bottom on new message
- handleKeyDown Enter → send message
- getAutoReply matches keywords

**File**: src/components/features/__tests__/chatbot.test.tsx (update)  
**Expected gain**: features 61% → ~63%

---

## Execution Order

1. Run: `npx vitest run` → baseline
2. Create storage.test.ts → run → verify
3. Create api/client.test.ts → run → verify  
4. Create auth/api.test.ts → run → verify
5. Update chatbot.test.tsx → run → verify
6. Run: `npx vitest run --coverage` → final report

## Target
- **Lines**: 80%+ (currently 62.23%)
- **Files covered**: +4 files, ~33 new tests