# User Service API Documentation

The User Service manages user profiles, authentication, addresses, and payment accounts. It implements a CQRS architecture using Vert.x Event Bus for internal communication.

## Authentication & Authorization

All private endpoints require a Bearer Token in the `Authorization` header.

### Register Customer
`POST /api/auth/register`

Creates a new customer account.

**Request Body:** `CustomerRegisterRequest`
- `username` (String): Unique username.
- `password` (String): User password.
- `email` (String): Unique email address.
- `firstname` (String): First name.
- `lastname` (String): Last name.
- `phoneNumber` (String): Primary phone number.

**Response:** `BaseResponse<CustomerResponse>`
- `CustomerResponse`:
    - `id` (UUID): User ID.
    - `username` (String)
    - `email` (String)
    - `firstname` (String)
    - `lastname` (String)
    - `phoneNumber` (String)

---

### Local Login
`POST /api/auth/login/local`

Authenticates using username and password.

**Request Body:** `LocalLoginRequest`
- `username` (String)
- `password` (String)

**Response:** `BaseResponse<Map<String, Object>>`
Success returns JWT tokens and user info.

---

### Google Login
`POST /api/auth/login/google`

Authenticates using a Google ID Token.

**Request Body:** `GoogleLoginRequest`
- `idToken` (String): The JWT token from Google.

**Response:** `BaseResponse<Map<String, Object>>`

---

### Logout
`POST /api/auth/logout`

Invalidates the current session.

**Request Body:** `RefreshTokenRequest`
- `refreshToken` (String)

**Response:** `BaseResponse<Void>`

---

### Refresh Token
`POST /api/auth/refresh-token`

Issues a new Access Token.

**Request Body:** `RefreshTokenRequest`
- `refreshToken` (String)

**Response:** `BaseResponse<Map<String, Object>>`

---

### Forget Password
`POST /api/auth/forget-password`

Sends a password reset link to the user's email.

**Request Body:** `ForgetPasswordRequest`
- `email` (String)

**Response:** `BaseResponse<Map<String, Object>>`

---

### Reset Password
`POST /api/auth/reset-password`

Resets the password using a token.

**Request Body:** `ResetPasswordRequest`
- `token` (String): The reset token.
- `newPassword` (String): The new password.

**Response:** `BaseResponse<Void>`

---

## User Profile Management

### Get My Profile
`GET /api/users/profile/me` (Protected)

**Response:** `BaseResponse<ProfileResponse>`
- `ProfileResponse`:
    - `userId` (UUID)
    - `username` (String)
    - `firstName` (String)
    - `lastName` (String)
    - `email` (String)
    - `phoneNumber` (String)
    - `imageUrl` (String): Avatar URL.
    - `displayName` (String)

---

### Update My Profile
`PUT /api/users/profile/me` (Protected)

**Request Body:** `UpdateProfileRequest`
- `firstname` (String)
- `lastname` (String)
- `email` (String)
- `phoneNumber` (String)
- `displayName` (String)

**Response:** `BaseResponse<ProfileResponse>`

---

### Change Avatar
`PUT /api/users/change-avatar/me` (Protected)

Updates the user's profile picture.

**Request Format:** `multipart/form-data`
- `avatar` (File): Image file.

**Response:** `BaseResponse<ProfileResponse>`

---

### Change Password
`PUT /api/users/change-password/me` (Protected)

**Request Body:** `ChangePasswordRequest`
- `oldPassword` (String)
- `newPassword` (String)

**Response:** `BaseResponse<Void>`

---

## Address Management

### Create Address
`POST /api/addresses` (Protected)

**Request Body:** `CreateNewAddressRequest`
- `province` (String)
- `city` (String)
- `ward` (String)
- `street` (String)
- `no` (String)
- `isDefault` (Boolean)
- `receiverPhoneNumber` (String)
- `receiverName` (String)

**Response:** `BaseResponse<AddressResponse>`
- `AddressResponse`:
    - `addressId` (UUID)
    - `customerId` (UUID)
    - `province` (String)
    - `city` (String)
    - `ward` (String)
    - `street` (String)
    - `no` (String)
    - `isDefault` (Boolean)
    - `receiverPhoneNumber` (String)
    - `receiverName` (String)
    - `updatedAt` (String)

---

### Update Address
`PUT /api/addresses/{addressId}` (Protected)

**Request Body:** `CreateNewAddressRequest`

**Response:** `BaseResponse<AddressResponse>`

---

### Set Default Address
`PATCH /api/addresses/set-default/{addressId}` (Protected)

**Response:** `BaseResponse<AddressResponse>`

---

### Delete Address
`DELETE /api/addresses/{addressId}` (Protected)

**Response:** `BaseResponse<Void>`

---

### Get Default Address
`GET /api/addresses/default` (Protected)

**Response:** `AddressResponse`

---

### Get All Addresses
`GET /api/addresses` (Protected)

**Response:** `List<AddressResponse>`

---

### Get Address by ID
`GET /api/addresses/{addressId}` (Protected)

**Response:** `BaseResponse<AddressResponse>`

---

### Get Paged Addresses
`GET /api/addresses/paged` (Protected)

**QueryParams:** `BasePaginationRequest`
- `page` (int)
- `size` (int)
- `sortBy` (String)
- `sortDirection` (String)

**Response:** `PaginationBaseResponse<List<AddressResponse>>`

---

## Payment Account Management

### Create Payment Account
`POST /api/payment-accounts` (Protected)

**Request Body:** `CreatePaymentAccountRequest`
- `accountNumber` (String)
- `bankName` (String)
- `holderName` (String)
- `isDefault` (Boolean)
- `type` (PaymentAccountType): Enum (e.g., BANK_ACCOUNT, WALLET)
- `status` (AccountStatus): Enum (e.g., ACTIVE, INACTIVE)

**Response:** `BaseResponse<PaymentAccountResponse>`
- `PaymentAccountResponse`:
    - `paymentAccountId` (UUID)
    - `customerId` (UUID)
    - `accountNumber` (String)
    - `bankName` (String)
    - `holderName` (String)
    - `isDefault` (Boolean)
    - `type` (String)
    - `status` (String)
    - `updatedAt` (String)

---

### Update Payment Account
`PUT /api/payment-accounts/{paymentAccountId}` (Protected)

**Request Body:** `CreatePaymentAccountRequest`

**Response:** `BaseResponse<PaymentAccountResponse>`

---

### Set Default Payment Account
`PATCH /api/payment-accounts/set-default/{paymentAccountId}` (Protected)

**Response:** `BaseResponse<PaymentAccountResponse>`

---

### Delete Payment Account
`DELETE /api/payment-accounts/{paymentAccountId}` (Protected)

**Response:** `BaseResponse<Void>`

---

### Get Default Payment Accounts
`GET /api/payment-accounts/default` (Protected)

**Response:** `List<PaymentAccountResponse>`

---

### Get All Payment Accounts
`GET /api/payment-accounts` (Protected)

**Response:** `List<PaymentAccountResponse>`

---

### Get Payment Account by ID
`GET /api/payment-accounts/{paymentAccountId}` (Protected)

**Response:** `BaseResponse<PaymentAccountResponse>`

---

### Get Paged Payment Accounts
`GET /api/payment-accounts/paged` (Protected)

**QueryParams:** `BasePaginationRequest`

**Response:** `PaginationBaseResponse<List<PaymentAccountResponse>>`
