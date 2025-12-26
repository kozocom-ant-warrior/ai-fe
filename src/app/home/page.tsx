'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CvFilesTable from './components/CvFilesTable';
import UploadCvSection from './components/UploadCvSection';
import { CvFileFromBackend } from '../api/files';

export default function Home() {
  const [cvFiles, setCvFiles] = useState<File[]>([]);
  const [cvFilesFromBackend, setCvFilesFromBackend] = useState<CvFileFromBackend[]>([]);
  const [jdFiles, setJdFiles] = useState<File[]>([]);
  const [jdInputType, setJdInputType] = useState<'text' | 'file'>('text');
  const [jdText, setJdText] = useState('');
  const [responseRequirement, setResponseRequirement] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const router = useRouter();

  const handleCvUpload = (files: File[]) => {
    setCvFiles(prev => [...prev, ...files]);
  };

  const handleUploadSuccess = () => {
    // Trigger refresh trong CvFilesTable
    setRefreshTrigger(prev => prev + 1);
    // Clear local files sau khi upload thành công
    setCvFiles([]);
  };

  const handleJdFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = selectedFiles.filter(file => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        return ['doc', 'docx', 'pdf'].includes(extension || '');
      });
      setJdFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeCvFile = (index: number) => {
    setCvFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeJdFile = (index: number) => {
    setJdFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleLogout = () => {
    router.push('/');
  };

  const handleRemoveBackendFile = (id: string) => {
    setCvFilesFromBackend(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Hire Graph</h1>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Column 1: Upload CV */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Upload CV
            </h2>
            
            {/* CV Table */}
            <CvFilesTable
              cvFilesFromBackend={cvFilesFromBackend}
              cvFiles={cvFiles}
              onRemoveBackendFile={handleRemoveBackendFile}
              onRemoveNewFile={removeCvFile}
              refreshTrigger={refreshTrigger}
            />
            
            {/* Upload CV Section */}
            <UploadCvSection onUpload={handleCvUpload} onUploadSuccess={handleUploadSuccess} />
          </div>

          {/* Column 2: JD Input & Response Requirement */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Job Description & Yêu cầu
            </h2>
            
            <div className="space-y-6">
              {/* JD Input Type Switch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Chọn cách nhập JD
                </label>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="jd-input-type"
                      value="text"
                      checked={jdInputType === 'text'}
                      onChange={(e) => setJdInputType(e.target.value as 'text' | 'file')}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-gray-700">Nhập text</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="jd-input-type"
                      value="file"
                      checked={jdInputType === 'file'}
                      onChange={(e) => setJdInputType(e.target.value as 'text' | 'file')}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-gray-700">Upload file</span>
                  </label>
                </div>
              </div>

              {/* JD Text Input */}
              {jdInputType === 'text' && (
                <div>
                  <label
                    htmlFor="jd-text"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Mô tả công việc (JD)
                  </label>
                  <textarea
                    id="jd-text"
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    rows={8}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition resize-none"
                    placeholder="Nhập mô tả công việc tại đây..."
                  />
                </div>
              )}

              {/* JD File Upload */}
              {jdInputType === 'file' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload JD
                  </label>
                  <div className="mb-4">
                    <label
                      htmlFor="jd-file-upload"
                      className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg
                          className="w-10 h-10 mb-3 text-gray-400"
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
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click để upload</span> hoặc kéo thả
                        </p>
                        <p className="text-xs text-gray-500">
                          DOC, DOCX, PDF (MAX. 10MB mỗi file)
                        </p>
                      </div>
                      <input
                        id="jd-file-upload"
                        type="file"
                        className="hidden"
                        multiple
                        accept=".doc,.docx,.pdf"
                        onChange={handleJdFileChange}
                      />
                    </label>
                  </div>

                  {/* File List */}
                  {jdFiles.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Files đã upload ({jdFiles.length})
                      </h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {jdFiles.map((file, index) => (
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
                              onClick={() => removeJdFile(index)}
                              className="ml-2 text-red-600 hover:text-red-800 transition"
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
                    </div>
                  )}
                </div>
              )}

              {/* Response Requirement Input */}
              <div>
                <label
                  htmlFor="response-requirement"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Yêu cầu response
                </label>
                <textarea
                  id="response-requirement"
                  value={responseRequirement}
                  onChange={(e) => setResponseRequirement(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition resize-none"
                  placeholder="Ví dụ: 'Trả về 2 CV phù hợp với JD', 'Sắp xếp mức độ phù hợp của CV với JD theo thứ tự giảm dần', 'Trả về CV phù hợp với JD và có điểm tương đồng cao nhất', ..."
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

