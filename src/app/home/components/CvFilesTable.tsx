'use client';

import ConfirmDialog from '../../components/ConfirmDialog';
import type { CvFileFromBackend } from '../../types/file.types';
import type { CvFilesTableProps } from '../../types/component.types';
import { useCvFilesTable } from '../hooks/useCvFilesTable';

export default function CvFilesTable(props: CvFilesTableProps) {
  const {
    currentPage,
    setCurrentPage,
    isLoading,
    isRefreshing,
    error,
    fileToDelete,
    isDeleting,
    tableOpacity,
    selectedBackendFiles,
    selectedNewFiles,
    totalCvFiles,
    totalPages,
    paginatedCvFiles,
    handleRemoveBackendFileClick,
    confirmDelete,
    cancelDelete,
    handleBackendFileSelect,
    handleNewFileSelect,
    handleSelectAll,
    isAllSelected,
    getSelectedCount,
    handleClearSelection,
    handleDeleteSelected,
    handleRemoveNewFile,
  } = useCvFilesTable(props);


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
      {/* Total CV count and Delete button */}
      <div className="mb-3 flex items-center justify-between min-h-[32px]">
        <p className="text-sm text-gray-700">
          Tổng số CV: <span className="font-semibold">{totalCvFiles}</span>
          {getSelectedCount() > 0 && (
            <span className="ml-3 text-indigo-600">
              (Đã chọn: {getSelectedCount()})
            </span>
          )}
        </p>
        <div className="flex items-center space-x-2" style={{ visibility: getSelectedCount() > 0 ? 'visible' : 'hidden' }}>
          <button
            onClick={handleClearSelection}
            disabled={isDeleting}
            className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Hủy
          </button>
          <button
            onClick={handleDeleteSelected}
            disabled={isDeleting}
            className="px-3 py-1 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isDeleting ? 'Đang xóa...' : `Xóa ${getSelectedCount()} file`}
          </button>
        </div>
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
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider" style={{ width: '40px' }}>
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected()}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                    />
                  </div>
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider" style={{ width: '240px' }}>
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
                const fileId = file.id.toString();
                const isSelected = selectedBackendFiles.has(fileId);
                return (
                  <tr 
                    key={file.id} 
                    className={`hover:bg-gray-50 transition-all duration-300 animate-fade-in ${isSelected ? 'bg-indigo-50' : ''}`}
                    style={{ 
                      animationDelay: `${rowIndex * 50}ms`,
                      animationFillMode: 'both'
                    }}
                  >
                    <td className="px-3 py-2 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleBackendFileSelect(fileId)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                        />
                      </div>
                    </td>
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
                        className="text-red-600 hover:text-red-800 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                const isSelected = selectedNewFiles.has(index);
                return (
                  <tr 
                    key={`new-${index}`} 
                    className={`hover:bg-gray-50 transition-all duration-300 animate-fade-in ${isSelected ? 'bg-indigo-50' : ''}`}
                    style={{ 
                      animationDelay: `${rowIndex * 50}ms`,
                      animationFillMode: 'both'
                    }}
                  >
                    <td className="px-3 py-2 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleNewFileSelect(index)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                        />
                      </div>
                    </td>
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
                        onClick={() => handleRemoveNewFile(file)}
                        className="text-red-600 hover:text-red-800 transition cursor-pointer"
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
                // Display maximum 5 page numbers
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
        message={fileToDelete?.id === 'multiple' 
          ? `Bạn có chắc chắn muốn xóa ${getSelectedCount()} file đã chọn không?`
          : "Bạn có chắc chắn muốn xóa file này không?"}
        detailText={fileToDelete?.id === 'multiple' ? undefined : fileToDelete?.name}
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

