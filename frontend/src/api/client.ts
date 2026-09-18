import axios, { type InternalAxiosRequestConfig } from 'axios';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '../utils/token';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Endpoints that must never trigger the refresh flow — they are either
// public (login) or the refresh/revoke calls themselves (recursion guard).
const AUTH_ENDPOINTS = [
  '/auth/admin/login',
  '/auth/owner/login',
  '/auth/trainer/login',
  '/auth/refresh',
  '/auth/revoke',
];

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Single-flight refresh: parallel 401s share one refresh call.
let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    // Bare axios on purpose — this call must not recurse through the
    // interceptors defined below.
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
    const newAccessToken: string | undefined = response.data?.accessToken;
    const newRefreshToken: string | undefined = response.data?.refreshToken;
    if (!newAccessToken) return null;
    setTokens(newAccessToken, newRefreshToken);
    return newAccessToken;
  } catch {
    return null;
  }
};

const getRefreshedAccessToken = (): Promise<string | null> => {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error?.config as RetriableRequestConfig | undefined;
    const status = error?.response?.status;
    const url: string = originalRequest?.url ?? '';
    const isAuthEndpoint = AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));

    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      // Access token likely expired — try to refresh once, then replay the
      // original request with the new token.
      originalRequest._retry = true;
      const newAccessToken = await getRefreshedAccessToken();

      if (newAccessToken) {
        originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
        return apiClient(originalRequest);
      }

      // Refresh failed — the session is truly over.
      clearTokens();
      window.dispatchEvent(new Event('unauthorized'));
    } else if (status === 401) {
      // 401 on a public/auth endpoint, or an already-retried request —
      // clear the session (same behavior as before the refresh flow existed).
      clearTokens();
      window.dispatchEvent(new Event('unauthorized'));
    }

    return Promise.reject(error);
  }
);
