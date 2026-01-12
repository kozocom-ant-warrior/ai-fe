// File related types

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

export interface CvFileFromBackend {
  id: number | string;
  name: string;
  size: number; // bytes
  uploadDate: string;
  url?: string;
}

export interface UploadResponse {
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

export interface FileListResponse {
  total: number;
  files: UploadResponse[];
}

