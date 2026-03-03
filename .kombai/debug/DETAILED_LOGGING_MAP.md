# Detailed Logging Map - Session 20260303_112501_251273

Tôi đã thêm logging cực kỳ chi tiết ở mọi bước. Dưới đây là toàn bộ sơ đồ:

## 1. LOGIN FLOW (app/(auth)/login/LoginClient.tsx)

```
[LOGIN] After login - storing tokens
├── hasToken: boolean
├── hasRefreshToken: boolean  
├── tokenLength: number
└── refreshTokenLength: number

[LOGIN] authStorage.setTokens() completed

[LOGIN] Verification - tokens in storage after setTokens()
├── hasStoredToken: boolean
├── hasStoredRefresh: boolean
├── storedTokenMatches: boolean  ← CRITICAL: Phải là true
└── storedRefreshMatches: boolean ← CRITICAL: Phải là true

[LOGIN] Updated httpClient default headers
```

**Nếu `storedTokenMatches: false` → Token không được lưu đúng**

---

## 2. STORAGE OPERATIONS (infrastructure/persistence/storage.ts)

### setTokens() - Saving Tokens:
```
[STORAGE] setTokens() called
[STORAGE] Setting access token to COOKIE
[STORAGE] ✓ Access token saved to cookie
[STORAGE] Setting access token to LOCALSTORAGE
[STORAGE] ✓ Access token saved to localStorage
[STORAGE] Setting refresh token to LOCALSTORAGE
[STORAGE] ✓ Refresh token saved to localStorage
[STORAGE] setTokens() COMPLETED SUCCESSFULLY
```

### getAccessToken() - Retrieving Token:
```
[STORAGE] Getting access token...
[STORAGE] Cookie token check: {hasCookieToken: boolean}
[STORAGE] LocalStorage token check: {hasLocalStorageToken: boolean}
[STORAGE] Final token result: {source: "cookie|localStorage|none"}
```

**Nếu source là "none" → KHÔNG CÓ TOKEN ĐÃ LƯU**

---

## 3. REQUEST INTERCEPTOR

```
[REQUEST INTERCEPTOR] Token retrieval: {hasToken: boolean}
[REQUEST INTERCEPTOR] Token attached to Authorization header
[TOKEN DECODE] Decoded payload: {sub, iat, exp, role}
[TOKEN EXPIRY] Expiry calculation: {expiresInSeconds, isExpired}
```

**Nếu `isExpired: true` → ĐÂY LÀ LÝ DO 403**

---

## 4. ERROR INTERCEPTOR

```
[ERROR INTERCEPTOR TRIGGERED]: {status: 403, url: '/carts/add-to-cart'}
[REFRESH DECISION]: {shouldAttemptRefresh: true/false}
[REFRESH ATTEMPT STARTING]: {status: 403, isRefreshing: false}
```

---

## 5. REFRESH TOKEN CHECK

```
[REFRESH FLOW] Setting _retry flag to true
[REFRESH FLOW] Setting isRefreshing to true
[REFRESH FLOW] Calling authStorage.getRefreshToken()
[REFRESH FLOW] getRefreshToken() returned: {hasRefreshToken: boolean}
```

**Nếu `hasRefreshToken: false` → Không có refresh token**

---

## 6. REFRESH HTTP REQUEST

```
[REFRESH HTTP] Creating refresh request
[REFRESH HTTP] Making axios.post call
[REFRESH HTTP] axios.post completed successfully: {status: 200}
```

**Nếu status !== 200 → Refresh failed**

---

## 7. TOKEN EXTRACTION

```
[REFRESH RESPONSE]: {status: 200, hasData_data: true}
[REFRESH PARSE] Extracting accessToken and refreshToken from response.data.data
[REFRESH PARSE] Extracted tokens: {hasNewAccessToken: true}
```

**Nếu `hasNewAccessToken: false` → Không lấy được token mới**

---

## 8. TOKEN UPDATE & RETRY

```
[REFRESH SUCCESS]: {hasNewAccessToken: true}
[REFRESH STORAGE] Calling authStorage.setTokens with new tokens
[REFRESH STORAGE] authStorage.setTokens completed
[REFRESH RETRY] About to call httpClient() with original request
[REFRESH RETRY] httpClient() returned, returning result
```

**✅ Nếu thấy những log này = Token refresh THÀNH CÔNG**

---

## 9. CART REPO

```
[CART REPO] addToCart() called
[CART REPO] HTTP response received: {hasData: true}
[CART REPO] Zod validation passed
```

**✅ Nếu thấy `[CART REPO] Zod validation passed` = add to cart THÀNH CÔNG**

---

## QUICK CHECKLIST

- [ ] `[LOGIN] Verification` → `storedTokenMatches: true` ❓
- [ ] `[STORAGE] Final token result` → `source: "localStorage"` ❓
- [ ] `[TOKEN EXPIRY]` → `isExpired: false` ❓
- [ ] `[REFRESH DECISION]` → `shouldAttemptRefresh: true` ❓
- [ ] `[REFRESH FLOW]` → `hasRefreshToken: true` ❓
- [ ] `[REFRESH HTTP]` → `status: 200` ❓
- [ ] `[REFRESH PARSE]` → `hasNewAccessToken: true` ❓
- [ ] `[CART REPO]` → `Zod validation passed` ❓ → ✅ THÀNH CÔNG!

Hãy **hard refresh** (Ctrl+Shift+R) và **test lại**, rồi ghi lại tất cả log từ console.
