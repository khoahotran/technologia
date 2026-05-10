import { vi } from 'vitest';

export const mockApiResponse = <T>(data: T, status = 200, message = "Success") => ({
  status,
  message,
  data,
});

export const mockPaginatedResponse = <T>(data: T[], total = 0, page = 0, size = 10) => ({
  status: 200,
  message: "Success",
  data,
  page_number: page,
  page_size: size,
  count_items: total,
  count_pages: Math.ceil(total / size),
});

export const mockAuthResponses = {
  loginSuccess: {
    data: {
      accessToken: "access-token-123",
      refreshToken: "refresh-token-456",
      userId: "user-123",
    },
    status: 200,
    message: "Login successful",
  },
  refreshSuccess: {
    data: {
      accessToken: "new-access-token-789",
      refreshToken: "new-refresh-token-012",
    },
    status: 200,
    message: "Token refreshed",
  },
};
