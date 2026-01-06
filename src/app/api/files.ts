import axios from 'axios';
import { getAccessToken } from './authHelper';

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

import type { ApiFileResponse, CvFileFromBackend } from '../types/file.types';

export type { ApiFileResponse, CvFileFromBackend };

/**
 * Get list of all files from API
 * @returns Promise<CvFileFromBackend[]> List of transformed files
 */
export async function fetchFiles(): Promise<CvFileFromBackend[]> {
  try {
    const { data: responseData } = await apiClient.get('/files');
    
    // Log response for debugging
    console.log('API response:', responseData);
    
    // Check if response is an array
    let data: ApiFileResponse[] = [];
    
    if (responseData && typeof responseData === 'object') {
      data = responseData.files;
    } else {
      data = [];
    }
    
    // Transform API response to CvFileFromBackend format
    const transformedFiles: CvFileFromBackend[] = data.map((file) => ({
      id: file.id.toString(),
      name: file.original_filename || file.filename,
      size: file.file_size,
      uploadDate: file.uploaded_at,
      url: file.file_path,
    }));
    
    return transformedFiles;
  } catch (err) {
    console.error('Error fetching files:', err);
    throw new Error('Có lỗi xảy ra khi tải danh sách file');
  }
}

/**
 * Delete a file by ID
 * @param id ID of the file to delete
 * @returns Promise<void>
 */
export async function deleteFile(id: string): Promise<void> {
  try {
    await apiClient.delete(`cv/files/${id}`);
  } catch (err) {
    console.error('Error deleting file:', err);
    throw new Error('Có lỗi xảy ra khi xóa file');
  }
}

