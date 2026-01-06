'use client';

import { useState, useRef } from 'react';

export interface FileDropzoneProps {
  /** Callback when files are selected */
  onFilesSelected: (files: File[]) => void;
  /** Current list of files */
  files?: File[];
  /** Callback when a file is removed */
  onRemoveFile?: (index: number) => void;
  /** Accepted file types (default: .doc,.docx,.pdf) */
  accept?: string;
  /** Allow multiple file selection (default: true) */
  multiple?: boolean;
  /** Text displayed when no file is being dragged */
  placeholderText?: string;
  /** Text displayed when dragging a file */
  draggingText?: string;
  /** Text describing file types */
  fileTypesText?: string;
  /** Show file list (default: true) */
  showFileList?: boolean;
  /** Custom className for dropzone */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

export default function FileDropzone({
  onFilesSelected,
  files = [],
  onRemoveFile,
  accept = '.doc,.docx,.pdf',
  multiple = true,
  placeholderText = 'Kéo thả hoặc chọn file',
  draggingText = 'Thả file vào đây',
  fileTypesText = 'DOC, DOCX, PDF (MAX. 10MB mỗi file)',
  showFileList = true,
  className = '',
  disabled = false,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (fileList: File[]): File[] => {
    const validExtensions = accept
      .split(',')
      .map(ext => ext.trim().replace('.', '').toLowerCase());
    
    return fileList.filter(file => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      return extension && validExtensions.includes(extension);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = validateFiles(selectedFiles);
      onFilesSelected(validFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const validFiles = validateFiles(droppedFiles);
      onFilesSelected(validFiles);
    }
  };

  const handleSelectFiles = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple={multiple}
        accept={accept}
        onChange={handleFileChange}
        disabled={disabled}
      />

      {/* Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleSelectFiles}
        className={`w-full flex items-center justify-center px-4 py-3 border-2 border-dashed rounded-lg transition ${
          disabled
            ? 'cursor-not-allowed opacity-50 bg-gray-100 border-gray-200'
            : isDragging
            ? 'cursor-pointer border-indigo-500 bg-indigo-50'
            : 'cursor-pointer border-gray-300 bg-gray-50 hover:bg-gray-100'
        }`}
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
            {isDragging ? draggingText : placeholderText}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {fileTypesText}
          </p>
        </div>
      </div>

      {/* Selected Files List */}
      {showFileList && files.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {files.map((file, index) => (
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
              {onRemoveFile && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFile(index);
                  }}
                  className="ml-2 text-red-600 hover:text-red-800 transition"
                  title="Remove file"
                  disabled={disabled}
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
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

