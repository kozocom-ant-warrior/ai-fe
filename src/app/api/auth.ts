import axios from 'axios';

// Axios instance với base URL từ biến môi trường
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// Thêm interceptor để tự động thêm access token vào header
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Thêm interceptor để xử lý lỗi 401 (Unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ, xóa token và redirect về login
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
 * Đăng nhập với username và password
 * @param credentials Username và password
 * @returns Promise<LoginResponse> Response từ API
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
 * Đăng xuất
 * @returns Promise<void>
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } catch (err: any) {
    console.error('Error logging out:', err);
    // Không throw error vì logout có thể thành công ngay cả khi API fail
  }
}

/**
 * Lấy thông tin user hiện tại
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

