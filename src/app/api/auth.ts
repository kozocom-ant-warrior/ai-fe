import axios from 'axios';

// Axios instance with base URL from environment variable
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// Add interceptor to automatically add access token to header
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add interceptor to handle 401 (Unauthorized) errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, remove token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

import type { LoginRequest, LoginResponse, UserInfo } from '../types/auth.types';

export type { LoginRequest, LoginResponse, UserInfo };

/**
 * Login with username and password
 * @param credentials Username and password
 * @returns Promise<LoginResponse> Response from API
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  try {
    const { data } = await apiClient.post('/auth/login', credentials);
    
    return {
      success: true,
      data: data.data || data,
    };
  } catch (err: any) {
    console.error('Error logging in:', err);
    throw new Error(
      err.response?.data?.message || 'Có lỗi xảy ra khi đăng nhập'
    );
  }
}

/**
 * Logout
 * @returns Promise<void>
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } catch (err: any) {
    console.error('Error logging out:', err);
    // Don't throw error because logout can succeed even if API fails
  }
}

/**
 * Get current user information
 * @returns Promise<UserInfo>
 */
export async function getCurrentUser(): Promise<UserInfo> {
  try {
    const { data } = await apiClient.get('/auth/me');
    return data.data || data;
  } catch (err: any) {
    console.error('Error getting current user:', err);
    throw new Error(
      err.response?.data?.message || 'Có lỗi xảy ra khi lấy thông tin người dùng'
    );
  }
}

