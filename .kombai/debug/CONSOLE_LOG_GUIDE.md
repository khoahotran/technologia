# Console Log Guide for 403 Error Debugging
**Session ID:** 20260303_112035_230827

## What to Look For in Browser Console

I've added **prominent console.error() logs** that will appear in RED in the browser console. These are not real errors - they're just marked as errors for visibility.

### Expected Flow (All Should Appear):

```
1. [ERROR INTERCEPTOR TRIGGERED] 
   ↓ Shows: status: 403, url: '/carts/add-to-cart'

2. [REFRESH DECISION]
   ↓ Shows: shouldAttemptRefresh: true, isForbidden: true

3. [REFRESH ATTEMPT STARTING]
   ↓ Shows: status: 403, isRefreshing: false

4. [REFRESH CHECK]
   ↓ Shows: hasRefreshToken: true, refreshTokenLength: XXX

5. [REFRESH REQUEST]
   ↓ Shows: url: 'http://localhost:3000/api/auth/refresh-token'

6. [REFRESH RESPONSE]
   ↓ Shows: status: 200, hasData: true, hasData_data: true

7. [REFRESH SUCCESS]
   ↓ Shows: hasNewAccessToken: true, newAccessTokenLength: XXX

8. [RETRYING ORIGINAL REQUEST]
   ↓ Shows: originalUrl: '/carts/add-to-cart'

9. Item added to cart successfully ✅
```

### If It Breaks, You'll See:

| Log Message | Meaning | Problem |
|---|---|---|
| No `[ERROR INTERCEPTOR TRIGGERED]` | Error handler not called | Request succeeded (unlikely) |
| `[REFRESH DECISION] shouldAttemptRefresh: false` | Refresh not attempted | Status isn't 401/403, or already retried |
| `[REFRESH FAILED] No refresh token available` | No refresh token in storage | Token wasn't saved after login |
| `[REFRESH RESPONSE] status: 401/403/500` | Refresh endpoint failed | Backend refresh issue |
| `[REFRESH RESPONSE NOT OK]` | Response status wasn't 200/201 | Check what status code is returned |
| `[REFRESH ERROR CAUGHT]` | Refresh request threw exception | Network error or axios error |
| `[REDIRECTING TO LOGIN]` | Redirect happened | Refresh failed, going to login page |

## How to Provide the Log Output

1. **Open Browser DevTools:** Press `F12`
2. **Go to Console Tab**
3. **Clear Console:** `console.clear()`
4. **Reproduce the Error:**
   - Login with valid credentials
   - Navigate to a product
   - Click "Add to Cart"
5. **Copy ALL messages in RED** (console.error logs)
6. **Paste them in your next message**

Include everything from `[ERROR INTERCEPTOR TRIGGERED]` through the final result.

## Example of What to Share

```
[ERROR INTERCEPTOR TRIGGERED] {status: 403, url: '/carts/add-to-cart', method: 'post', hasResponse: true}

[REFRESH DECISION] {
  status: 403,
  isUnauthorized: false,
  isForbidden: true,
  hasRetried: false,
  isAuthRoute: false,
  shouldAttemptRefresh: true,
  url: '/carts/add-to-cart'
}

[REFRESH ATTEMPT STARTING] {status: 403, isRefreshing: false}

[REFRESH CHECK] {hasRefreshToken: true, refreshTokenLength: 245}

[REFRESH REQUEST] {
  url: 'http://localhost:3000/api/auth/refresh-token',
  hasRefreshToken: true,
  tokenPrefix: 'eyJhbGciOi...'
}

... (rest of the flow)
```

## Quick Troubleshooting

### If you don't see any RED logs:
- Your dev server might be running with the old code
- **Hard refresh:** Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Check if `pnpm dev` restarted after the code changes

### If logs stop at a certain point:
- That's where the problem is
- Example: If it stops at `[REFRESH FAILED] No refresh token`, the token wasn't saved

### If you see redirect happening:
- The refresh failed
- Look at the error details in `[REFRESH ERROR CAUGHT]`
- Check the response from `/auth/refresh-token` endpoint

---

**Once you share the logs, I can pinpoint the exact issue and provide a fix!**
