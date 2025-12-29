'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CvFilesTable from './components/CvFilesTable';
import UploadCvSection from './components/UploadCvSection';
import JdInputSection from './components/JdInputSection';
import { CvFileFromBackend } from '../api/files';

export default function Home() {
  const [cvFiles, setCvFiles] = useState<File[]>([]);
  const [cvFilesFromBackend, setCvFilesFromBackend] = useState<CvFileFromBackend[]>([]);
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

  const removeCvFile = (index: number) => {
    setCvFiles(prev => prev.filter((_, i) => i !== index));
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
          <JdInputSection />
        </div>
      </main>
    </div>
  );
}

