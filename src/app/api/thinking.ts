import axios from 'axios';
import { getAccessToken } from './authHelper';
import type { ThinkingRequest, ThinkingResponse } from '../types/thinking.types';

export type { ThinkingRequest, ThinkingResponse };

// Axios instance with base URL from environment variable
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// Add interceptor to automatically add access token to header
apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
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
      // Token expired or invalid, redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);


/**
 * Send thinking request to API
 * @param requestData Request data including JD text/files and advanced options
 * @returns Promise<ThinkingResponse> Response from API
 */
export async function sendThinkingRequest(
  requestData: ThinkingRequest
): Promise<ThinkingResponse> {
  try {
    // Prepare FormData
    const formData = new FormData();

    // Add JD text or files
    if (requestData.jdText) {
      formData.append('jd_text', requestData.jdText);
    } else if (requestData.jdFiles && requestData.jdFiles.length > 0) {
      requestData.jdFiles.forEach((file) => {
        formData.append('jd_files', file);
      });
    }

    // Add advanced options
    formData.append('advanced_options', JSON.stringify(requestData.advancedOptions));

    // Add max CV count if provided
    if (requestData.maxCvCount !== undefined) {
      formData.append('max_cv_count', requestData.maxCvCount.toString());
    }

    // Send request
    const { data } = await apiClient.post('/thinking', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      success: true,
      data,
    };
  } catch (err: any) {
    console.error('Error sending thinking request:', err);
    throw new Error(
      err.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu thinking'
    );
  }
}

