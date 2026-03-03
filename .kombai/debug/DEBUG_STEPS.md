# Debugging Steps for 403 Error - Session 20260303_111232_894000

## What I've Done
Added comprehensive debug logging to `infrastructure/http/client.ts` to track:
1. ✅ Token retrieval from storage
2. ✅ Token attachment to request headers
3. ✅ Token refresh decision and execution
4. ✅ Refresh token endpoint call and response
5. ✅ Error details during refresh

## Step 1: Open Browser Console
1. Press `F12` or `Ctrl+Shift+I` to open Developer Tools
2. Go to the **Console** tab
3. Clear console if there are old logs: `console.clear()`

## Step 2: Login
1. Fill in username/password and click "Sign In"
2. Watch the console - you'll see logs like:
   ```
   [DEBUG] [HTTP] Request {method: 'POST', url: '/auth/login/local', requestId: '...', hasAuthorization: false}
   [DEBUG] Token attached to request {tokenPrefix: '...', tokenLength: ...}
   [DEBUG] Response {status: 200, url: '/auth/login/local', requestId: '...'}
   ```

## Step 3: Navigate to Product Detail Page
1. Go to any product detail page
2. Watch for logs showing token is still attached

## Step 4: Click "Add to Cart"
1. Click the "Buy Now" button
2. **IMPORTANT:** Watch the console carefully. You should see:
   - Either: `[INFO] Token attached to request` (token was found)
   - Or: `[WARN] No token available for request` (token NOT found!)
   - Then: `[INFO] Token refresh decision {shouldAttemptRefresh: true/false, ...}`
   - Then: `[INFO] Attempting token refresh {hasRefreshToken: true/false, ...}`

## Step 5: Share Console Output
Copy and paste **ALL** console logs from login through the add-to-cart error. Focus on:

### ✅ Good Scenario (what we expect):
```
[DEBUG] Token attached to request {tokenPrefix: 'eyJhbGciOi...', tokenLength: 234}
[INFO] Token refresh decision {status: 403, shouldAttemptRefresh: true, isAuthRoute: false}
[INFO] Attempting token refresh {hasRefreshToken: true, refreshTokenLength: 250}
[DEBUG] Sending refresh token request {refreshTokenPrefix: 'eyJhbGciOi...'}
[INFO] Token refresh response received {hasNewAccessToken: true, newAccessTokenLength: 200}
[INFO] Token refreshed successfully and retrying request {originalUrl: '/carts/add-to-cart', newTokenPrefix: 'eyJhbGciOi...'}
[DEBUG] Request {method: 'POST', url: '/carts/add-to-cart', requestId: '...', hasAuthorization: true}
✅ Add to cart succeeds
```

### ❌ Problem Scenario 1 - No Token Found:
```
[WARN] No token available for request {url: '/carts/add-to-cart', method: 'POST'}
[ERROR] API Error {status: 403, url: '/carts/add-to-cart', ...}
[INFO] Token refresh decision {status: 403, shouldAttemptRefresh: true, isAuthRoute: false}
[ERROR] No refresh token available for refresh attempt {url: '/carts/add-to-cart'}
```
**This means:** Token was cleared or not stored after login

### ❌ Problem Scenario 2 - Refresh Fails:
```
[DEBUG] Token attached to request {tokenPrefix: '...', tokenLength: 234}
[INFO] Token refresh decision {status: 403, shouldAttemptRefresh: true}
[INFO] Attempting token refresh {hasRefreshToken: true, refreshTokenLength: 250}
[ERROR] Token refresh failed with error {errorMessage: '...', errorStatus: 401}
[ERROR] Token refresh failed - redirecting to login {errorParam: 'forbidden'}
```
**This means:** Refresh token is invalid or expired

## Token Expiry Checking (NOW AUTOMATIC IN LOGS)

The debug logs NOW show token expiry information:
```
Token attached to request {
    tokenPrefix: 'eyJhbGciOi...',
    tokenLength: 234,
    exp: '2026-03-03T11:25:20.000Z',      ← When token expires
    expiresInSeconds: 300,                 ← How many seconds left
    isExpired: false                       ← Already expired?
}
```

**⚠️ If you see `isExpired: true`, that's your problem!**

Token expiry from your cookie:
- `"iat": 1772434390` (issued at)
- `"exp": 1772435290` (expires at)
- **Duration: ~900 seconds = 15 minutes**

So if there's a delay between login and add-to-cart, the token may already be expired.

## What to Check in Browser DevTools

### Network Tab:
1. Click the **Network** tab
2. When you click "Add to Cart", watch for the request to `/api/carts/add-to-cart`
3. Right-click → **Edit and Resend**
4. Check:
   - `Headers` tab: Does it have `Authorization: Bearer <token>`?
   - `Response` tab: What does the server return?

### Application/Storage Tab:
1. Click **Application** or **Storage** tab
2. Look for **Cookies** → localhost:3000
3. Check if `access_token` cookie is present
4. Look for **Local Storage** → http://localhost:3000
5. Check if `access_token` key is present

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Token not in storage after login | Check LoginClient.tsx - `authStorage.setTokens()` call |
| Token expires too quickly (15 min) | This is backend-controlled, not our issue |
| Refresh token is invalid | Token might have been cleared elsewhere |
| 403 still after refresh attempt | Backend issue - refresh endpoint might be failing |

## Next Steps After Debugging
Share the console logs and we can:
1. Pinpoint exactly where the flow breaks
2. Add more detailed logging if needed
3. Fix the root cause

---
**Remember:** These are TEMPORARY debug logs. Once we fix the issue, I'll remove them and clean up.
