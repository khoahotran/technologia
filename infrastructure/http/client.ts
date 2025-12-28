import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
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
