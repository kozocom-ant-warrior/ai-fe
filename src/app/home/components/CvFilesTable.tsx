'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../components/ConfirmDialog';
import { fetchFiles, deleteFile } from '../../api/files';
import type { CvFileFromBackend } from '../../types/file.types';
import type { CvFilesTableProps } from '../../types/component.types';

export default function CvFilesTable({
  cvFilesFromBackend: cvFilesFromBackendProp,
  cvFiles,
  onRemoveBackendFile,
  onRemoveNewFile,
  itemsPerPage = 5,
  refreshTrigger,
}: CvFilesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [cvFilesFromBackend, setCvFilesFromBackend] = useState<CvFileFromBackend[]>(cvFilesFromBackendProp || []);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileToDelete, setFileToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [tableOpacity, setTableOpacity] = useState(1);

  // Fetch data từ API
  const loadFiles = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
      setTableOpacity(0.5);
    } else {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      const transformedFiles = await fetchFiles();
      
      // Fade in animation sau khi load xong
      if (isRefresh) {
        // Đợi một chút để animation fade out hoàn tất
        await new Promise(resolve => setTimeout(resolve, 150));
        setCvFilesFromBackend(transformedFiles);
        // Fade in lại
        setTimeout(() => {
          setTableOpacity(1);
        }, 50);
      } else {
        setCvFilesFromBackend(transformedFiles);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải danh sách file';
      setError(errorMessage);
      toast.error(errorMessage);
      if (isRefresh) {
        setTableOpacity(1);
      }
    } finally {
      if (isRefresh) {
        setTimeout(() => {
          setIsRefreshing(false);
        }, 300);
      } else {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  // Refresh khi refreshTrigger thay đổi (sau khi upload thành công)
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      loadFiles(true);
    }
  }, [refreshTrigger]);

  // Tính toán phân trang
  const totalCvFiles = cvFilesFromBackend.length + cvFiles.length;
  const totalPages = Math.ceil(totalCvFiles / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Kết hợp CV từ backend và CV mới upload, sau đó slice theo trang
  // File mới upload sẽ hiển thị ở đầu (đảo ngược cvFiles để file mới nhất lên đầu)
  const newFiles = cvFiles.map((file, index) => ({ 
    type: 'new' as const, 
    data: file, 
    index 
  })).reverse(); // Đảo ngược để file mới nhất lên đầu
  
  const allCvFiles = [
    ...newFiles,
    ...cvFilesFromBackend.map(file => ({ type: 'backend' as const, data: file }))
  ];
  const paginatedCvFiles = allCvFiles.slice(startIndex, endIndex);

  // Reset về trang cuối khi xóa file
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Mở popup confirm xóa file
  const handleRemoveBackendFileClick = (id: string, name: string) => {
    setFileToDelete({ id, name });
  };

  // Xác nhận xóa file
  const confirmDelete = async () => {
    if (!fileToDelete) return;

    const { id } = fileToDelete;
    setIsDeleting(true);
    
    // Optimistic update - xóa file khỏi UI ngay lập tức
    const originalFiles = [...cvFilesFromBackend];
    setCvFilesFromBackend(prev => prev.filter(f => f.id.toString() !== id));
    onRemoveBackendFile(id);
    setFileToDelete(null);
    
    try {
      await deleteFile(id);
      
      // Hiển thị thông báo thành công bằng toast
      const fileName = fileToDelete.name;
      toast.success(`Đã xóa file "${fileName}" thành công.`);
      
      // Refresh danh sách file sau khi xóa thành công
      await loadFiles(true);
    } catch (err) {
      // Revert optimistic update nếu có lỗi
      setCvFilesFromBackend(originalFiles);
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa file';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error deleting file:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Hủy xóa file
  const cancelDelete = () => {
    setFileToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="mb-6 flex items-center justify-center py-8">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-8 w-8 text-indigo-600 mb-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-sm text-gray-600">Đang tải danh sách file...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-red-700 hover:text-red-900 underline"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (totalCvFiles === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      {/* Tổng số CV */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-gray-700">
          Tổng số CV: <span className="font-semibold">{totalCvFiles}</span>
        </p>
      </div>
      
      <div className="overflow-x-auto relative">
        {/* Refresh overlay */}
        {isRefreshing && (
          <div className="absolute inset-0 bg-white bg-opacity-50 z-10 flex items-center justify-center rounded-lg transition-opacity duration-300">
            <div className="flex flex-col items-center">
              <svg
                className="animate-spin h-6 w-6 text-indigo-600 mb-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p className="text-xs text-gray-600">Đang cập nhật...</p>
            </div>
          </div>
        )}
        
        <div 
          className="border border-gray-200 rounded-lg overflow-hidden transition-opacity duration-300" 
          style={{ height: '250px', opacity: tableOpacity }}
        >
          <table className="min-w-full divide-y divide-gray-200" style={{ tableLayout: 'fixed', width: '100%' }}>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Tên file
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Kích thước
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Ngày upload
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {paginatedCvFiles.map((item, rowIndex) => {
              if (item.type === 'backend') {
                const file = item.data as CvFileFromBackend;
                return (
                  <tr 
                    key={file.id} 
                    className="hover:bg-gray-50 transition-all duration-300 animate-fade-in"
                    style={{ 
                      animationDelay: `${rowIndex * 50}ms`,
                      animationFillMode: 'both'
                    }}
                  >
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 text-indigo-600 mr-2 flex-shrink-0"
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
                        <span className="text-sm text-gray-900 truncate w-[160px] block">
                          {file.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {new Date(file.uploadDate).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleRemoveBackendFileClick(file.id.toString(), file.name)}
                        disabled={isDeleting}
                        className="text-red-600 hover:text-red-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Xóa file"
                      >
                        <svg
                          className="w-4 h-4 mx-auto"
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
                    </td>
                  </tr>
                );
              } else {
                const file = item.data as File;
                const index = item.index!;
                return (
                  <tr 
                    key={`new-${index}`} 
                    className="hover:bg-gray-50 transition-all duration-300 animate-fade-in"
                    style={{ 
                      animationDelay: `${rowIndex * 50}ms`,
                      animationFillMode: 'both'
                    }}
                  >
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 text-indigo-600 mr-2 flex-shrink-0"
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
                        <span className="text-sm text-gray-900 truncate w-[200px] block">
                          {file.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {new Date().toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-center">
                      <button
                        onClick={() => {
                          // Tìm index chính xác trong cvFiles gốc
                          const actualIndex = cvFiles.findIndex(f => f.name === file.name && f.size === file.size);
                          if (actualIndex !== -1) {
                            onRemoveNewFile(actualIndex);
                          }
                        }}
                        className="text-red-600 hover:text-red-800 transition"
                        title="Xóa file"
                      >
                        <svg
                          className="w-4 h-4 mx-auto"
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
                    </td>
                  </tr>
                );
              }
            })}
           
          </tbody>
        </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Trang {currentPage} / {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Trước
            </button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Hiển thị tối đa 5 số trang
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 text-sm font-medium rounded-md transition ${
                        currentPage === page
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="px-2 text-gray-500">...</span>;
                }
                return null;
              })}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Popup */}
      <ConfirmDialog
        isOpen={!!fileToDelete}
        title="Xác nhận xóa file"
        message="Bạn có chắc chắn muốn xóa file này không?"
        detailText={fileToDelete?.name}
        warningText="Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isLoading={isDeleting}
        confirmButtonColor="red"
      />
    </div>
  );
}

