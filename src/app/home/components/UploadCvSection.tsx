'use client';

import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import Button from '../../components/Button';

interface UploadCvSectionProps {
  onUpload: (files: File[]) => void;
  onUploadSuccess?: () => void;
}

interface UploadResponse {
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

interface FileListResponse {
  total: number;
  files: UploadResponse[];
}

export default function UploadCvSection({ onUpload, onUploadSuccess }: UploadCvSectionProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(file => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        return ['doc', 'docx', 'pdf'].includes(extension || '');
      });
      setSelectedFiles(validFiles);
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // Tạo FormData và append tất cả files với cùng field name "files"
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('http://localhost:8000/cv/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} ${errorText}`);
      }

      const data: FileListResponse = await response.json();
      
      // Call the onUpload callback with the files
      onUpload(selectedFiles);
      
      // Hiển thị toast thành công
      toast.success(`Đã upload thành công ${data.total} file(s)`);
      
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Call onUploadSuccess callback to trigger refresh
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi upload file';
      setUploadError(errorMessage);
      toast.error(errorMessage);
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSelectFiles = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* File Input (ẩn) */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        accept=".doc,.docx,.pdf"
        onChange={handleFileChange}
      />

      {/* Nút chọn file */}
      <button
        type="button"
        onClick={handleSelectFiles}
        className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
      >
        <div className="flex flex-col items-center">
          <svg
            className="w-8 h-8 mb-2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-sm text-gray-600 font-medium">
            Chọn file CV
          </p>
          <p className="text-xs text-gray-500 mt-1">
            DOC, DOCX, PDF (MAX. 10MB mỗi file)
          </p>
        </div>
      </button>

      {/* Danh sách file đã chọn */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <svg
                  className="w-5 h-5 text-indigo-600 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="text-sm text-gray-700 truncate">
                  {file.name}
                </span>
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <button
                onClick={() => handleRemoveFile(index)}
                className="ml-2 text-red-600 hover:text-red-800 transition"
                title="Xóa file"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Error message */}
      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{uploadError}</p>
        </div>
      )}

      {/* Nút Upload - luôn hiển thị */}
      <Button
        text={`Upload CV ${selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}`}
        onClick={handleUpload}
        disabled={selectedFiles.length === 0}
        isLoading={isUploading}
        loadingText="Đang upload..."
        fullWidth
        variant="primary"
      />
    </div>
  );
}

