import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import MockAdapter from 'axios-mock-adapter';

// Environment variable to toggle mock mode
const USE_MOCK = process.env['NEXT_PUBLIC_USE_MOCK'] === 'true';
const BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3000/api';

// Create Axios instance
export const httpClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Configure Mock Adapter
export const mock = new MockAdapter(httpClient, { delayResponse: 500, onNoMatch: 'passthrough' });

if (!USE_MOCK) {
    mock.restore();
} else {
    console.log('🔶 [Mock] Mock API is enabled.');
}

// Request Interceptor
httpClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Attach token if exists
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
httpClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    async (error) => {
        // Handle global errors like 401
        if (error.response?.status === 401) {
            // Optional: Redirect to login or refresh token
            if (typeof window !== 'undefined') {
                // window.location.href = '/login'; 
            }
        }
        return Promise.reject(error);
    }
);
