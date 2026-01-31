import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig, AxiosError } from 'axios';

const BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3000/api';

// Create Axios instance
export const httpClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request Interceptor
httpClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem("access_token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

interface FailedRequest {
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });

    failedQueue = [];
};

// Response Interceptor
httpClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (!error.response) {
            return Promise.reject(error);
        }

        // Handle 401 Unauthorized
        if (error.response.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = 'Bearer ' + token;
                        }
                        return httpClient(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = typeof window !== 'undefined' ? localStorage.getItem("refresh_token") : null;

            if (!refreshToken) {
                if (typeof window !== 'undefined') {
                    // window.location.href = '/login';
                }
                return Promise.reject(error);
            }

            try {
                const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {
                    refreshToken: refreshToken
                });

                if (response.status === 200 || response.status === 201) {
                    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;

                    if (typeof window !== 'undefined') {
                        localStorage.setItem("access_token", newAccessToken);
                        if (newRefreshToken) localStorage.setItem("refresh_token", newRefreshToken);
                    }

                    httpClient.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;

                    processQueue(null, newAccessToken);

                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = 'Bearer ' + newAccessToken;
                    }
                    return httpClient(originalRequest);
                }
            } catch (err) {
                processQueue(err, null);
                if (typeof window !== 'undefined') {
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                    window.location.href = '/login';
                }
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);
