'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../providers/AuthProvider';
import CvFilesTable from './components/CvFilesTable';
import UploadCvSection from './components/UploadCvSection';
import JdInputSection from './components/JdInputSection';
import CvMappingsTable from './components/CvMappingsTable';
import { CvFileFromBackend } from '../api/files';
import type { CvMapping } from '../types/cv.types';

export default function Home() {
  const [cvFiles, setCvFiles] = useState<File[]>([]);
  const [cvFilesFromBackend, setCvFilesFromBackend] = useState<CvFileFromBackend[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [cvMappings, setCvMappings] = useState<CvMapping[]>([]);
  const router = useRouter();
  const auth = useAuth();

  // Redirect to login nếu chưa authenticated
  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.push('/');
    }
  }, [auth.isAuthenticated, auth.isLoading, router]);

  const handleCvUpload = (files: File[]) => {
    setCvFiles(prev => [...prev, ...files]);
  };

  const handleUploadSuccess = () => {
    // Trigger refresh trong CvFilesTable
    setRefreshTrigger(prev => prev + 1);
    // Clear local files sau khi upload thành công
    setCvFiles([]);
  };

  const removeCvFile = (index: number) => {
    setCvFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleLogout = async () => {
    await auth.logout();
  };

  // Hiển thị loading nếu đang check authentication
  if (auth.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-700">Đang tải...</div>
        </div>
      </div>
    );
  }

  // Hiển thị nothing nếu chưa authenticated (sẽ redirect)
  if (!auth.isAuthenticated) {
    return null;
  }

  const handleRemoveBackendFile = (id: string) => {
    setCvFilesFromBackend(prev => prev.filter(f => f.id !== id));
  };

  const handleThinkingSuccess = (mappings: CvMapping[]) => {
    setCvMappings(mappings);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Hire Graph</h1>
            <div className="flex items-center gap-4">
              {auth.user?.email && (
                <span className="text-sm text-gray-600">
                  {auth.user.email}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8 py-8">
        {/* CV Mappings Table - Full width phía trên */}
        {cvMappings.length > 0 && (
          <div className="mb-6">
            <CvMappingsTable cvMappings={cvMappings} />
          </div>
        )}

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
          <JdInputSection onThinkingSuccess={handleThinkingSuccess} />
        </div>
      </main>
    </div>
  );
}

