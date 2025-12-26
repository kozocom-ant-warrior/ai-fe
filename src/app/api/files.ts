import axios from 'axios';

// Axios instance với base URL từ biến môi trường
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// Interface cho response từ API /files
export interface ApiFileResponse {
  id: number;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  file_hash: string;
  content_type: string;
  uploaded_at: string;
  updated_at: string;
}

// Interface cho CV file từ backend API
export interface CvFileFromBackend {
  id: number | string;
  name: string;
  size: number; // bytes
  uploadDate: string;
  url?: string;
}

/**
 * Lấy danh sách tất cả files từ API
 * @returns Promise<CvFileFromBackend[]> Danh sách files đã được transform
 */
export async function fetchFiles(): Promise<CvFileFromBackend[]> {
  try {
    const { data: responseData } = await apiClient.get('/files');
    
    // Log response để debug
    console.log('API response:', responseData);
    
    // Kiểm tra xem response có phải là array không
    let data: ApiFileResponse[] = [];
    
    if (responseData && typeof responseData === 'object') {
      data = responseData.files;
    } else {
      data = [];
    }
    
    // Transform API response thành format CvFileFromBackend
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
 * Xóa một file theo ID
 * @param id ID của file cần xóa
 * @returns Promise<void>
 */
export async function deleteFile(id: string): Promise<void> {
  try {
    await apiClient.delete(`/files/${id}`);
  } catch (err) {
    console.error('Error deleting file:', err);
    throw new Error('Có lỗi xảy ra khi xóa file');
  }
}

