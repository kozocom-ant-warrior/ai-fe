'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import Button from '../../components/Button';
import FileDropzone from './FileDropzone';
import type { UploadCvSectionProps } from '../../types/component.types';
import type { UploadResponse, FileListResponse } from '../../types/file.types';

export default function UploadCvSection({ onUpload, onUploadSuccess }: UploadCvSectionProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
    setUploadError(null);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // Create FormData and append all files with the same field name "files"
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
      
      // Show success toast
      toast.success(`Đã upload thành công ${data.total} file(s)`);
      
      setSelectedFiles([]);

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

  return (
    <div className="space-y-4">
      {/* File Dropzone */}
      <FileDropzone
        onFilesSelected={handleFilesSelected}
        files={selectedFiles}
        onRemoveFile={handleRemoveFile}
        placeholderText="Kéo thả hoặc chọn file CV"
        draggingText="Thả file vào đây"
        fileTypesText="DOC, DOCX, PDF (MAX. 10MB mỗi file)"
        disabled={isUploading}
      />

      {/* Error message */}
      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{uploadError}</p>
        </div>
      )}

      {/* Upload Button - always visible */}
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

