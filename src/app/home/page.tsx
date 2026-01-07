'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../providers/AuthProvider';
import Header from '../components/Header';
import CvFilesTable from './components/CvFilesTable';
import UploadCvSection from './components/UploadCvSection';
import JdInputSection from './components/JdInputSection';
import CvMappingsTable from './components/CvMappingsTable';
import { CvFileFromBackend, fetchFiles } from '../api/files';
import { mockCvMappings } from '../data/mockCvMappings';
import type { CvMapping } from '../types/cv.types';

// Set to true to use mock data instead of API
const USE_MOCK_DATA = false;

export default function Home() {
  const [cvFiles, setCvFiles] = useState<File[]>([]);
  const [cvFilesFromBackend, setCvFilesFromBackend] = useState<CvFileFromBackend[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [cvMappings, setCvMappings] = useState<CvMapping[]>([]);
  const [maxCvCount, setMaxCvCount] = useState<number>(5);
  const router = useRouter();
  const auth = useAuth();

  // Load mock data on mount if enabled
  useEffect(() => {
    if (USE_MOCK_DATA) {
      setCvMappings(mockCvMappings);
    }
  }, []);

  // Load CV files from backend
  useEffect(() => {
    const loadCvFiles = async () => {
      try {
        const files = await fetchFiles();
        setCvFilesFromBackend(files);
      } catch (error) {
        console.error('Error loading CV files:', error);
      }
    };
    
    if (auth.isAuthenticated) {
      loadCvFiles();
    }
  }, [auth.isAuthenticated, refreshTrigger]);

  // Calculate total CV count from backend
  const totalCvCount = cvFilesFromBackend.length;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.push('/');
    }
  }, [auth.isAuthenticated, auth.isLoading, router]);

  // Ensure maxCvCount doesn't exceed totalCvCount
  useEffect(() => {
    if (totalCvCount > 0 && maxCvCount > totalCvCount) {
      setMaxCvCount(totalCvCount);
    }
  }, [totalCvCount, maxCvCount]);

  const handleCvUpload = (files: File[]) => {
    setCvFiles(prev => [...prev, ...files]);
  };

  const handleUploadSuccess = () => {
    // Trigger refresh in CvFilesTable
    setRefreshTrigger(prev => prev + 1);
    // Clear local files after successful upload
    setCvFiles([]);
  };

  const removeCvFile = (index: number) => {
    setCvFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveBackendFile = (id: string) => {
    setCvFilesFromBackend(prev => prev.filter(f => f.id !== id));
  };

  const handleThinkingSuccess = (mappings: CvMapping[]) => {
    // Only update if not using mock data, or allow override
    if (!USE_MOCK_DATA || mappings.length > 0) {
      setCvMappings(mappings);
    }
  };

  // Show loading if checking authentication
  if (auth.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-700">Loading...</div>
        </div>
      </div>
    );
  }

  // Show nothing if not authenticated (will redirect)
  if (!auth.isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8 py-8">
        {/* CV Mappings Table - Full width at the top */}
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
          <JdInputSection 
            onThinkingSuccess={handleThinkingSuccess} 
            maxCvCount={maxCvCount}
            onMaxCvCountChange={setMaxCvCount}
            totalCvCount={totalCvCount}
          />
        </div>
      </main>
    </div>
  );
}

