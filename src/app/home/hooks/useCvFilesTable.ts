import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { fetchFiles, deleteFile } from '../../api/files';
import type { CvFileFromBackend } from '../../types/file.types';
import type { CvFilesTableProps } from '../../types/component.types';

type CvFileItem = 
  | { type: 'backend'; data: CvFileFromBackend }
  | { type: 'new'; data: File; index: number };

export function useCvFilesTable({
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
  const [selectedBackendFiles, setSelectedBackendFiles] = useState<Set<string>>(new Set());
  const [selectedNewFiles, setSelectedNewFiles] = useState<Set<number>>(new Set());

  // Fetch data from API
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
      
      // Fade in animation after loading completes
      if (isRefresh) {
        // Wait a bit for fade out animation to complete
        await new Promise(resolve => setTimeout(resolve, 150));
        setCvFilesFromBackend(transformedFiles);
        // Fade in again
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

  // Refresh when refreshTrigger changes (after successful upload)
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      loadFiles(true);
    }
  }, [refreshTrigger]);

  // Calculate pagination and file lists
  const totalCvFiles = cvFilesFromBackend.length + cvFiles.length;
  const totalPages = Math.ceil(totalCvFiles / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Combine CV from backend and newly uploaded CV, then slice by page
  // Newly uploaded files will be displayed at the top (reverse cvFiles so newest file is first)
  const allCvFiles = useMemo<CvFileItem[]>(() => {
    const newFiles = cvFiles.map((file, index) => ({ 
      type: 'new' as const, 
      data: file, 
      index 
    })).reverse(); // Reverse so newest file is first
    
    return [
      ...newFiles,
      ...cvFilesFromBackend.map(file => ({ type: 'backend' as const, data: file }))
    ];
  }, [cvFiles, cvFilesFromBackend]);

  const paginatedCvFiles = useMemo(() => {
    return allCvFiles.slice(startIndex, endIndex);
  }, [allCvFiles, startIndex, endIndex]);

  // Reset to last page when deleting file
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Clean up invalid selections when files change
  useEffect(() => {
    // Remove selections for backend files that no longer exist
    setSelectedBackendFiles(prev => {
      const validIds = new Set(cvFilesFromBackend.map(f => f.id.toString()));
      return new Set(Array.from(prev).filter(id => validIds.has(id)));
    });
    
    // Remove selections for new files that no longer exist
    setSelectedNewFiles(prev => {
      const validIndices = new Set(cvFiles.map((_, index) => index));
      return new Set(Array.from(prev).filter(index => validIndices.has(index)));
    });
  }, [cvFilesFromBackend, cvFiles]);

  // Open confirm delete file popup
  const handleRemoveBackendFileClick = (id: string, name: string) => {
    setFileToDelete({ id, name });
  };

  // Confirm delete file
  const confirmDelete = async () => {
    if (!fileToDelete) return;

    const { id } = fileToDelete;
    
    // Handle multiple deletion
    if (id === 'multiple') {
      await confirmDeleteMultiple();
      return;
    }
    
    setIsDeleting(true);
    
    // Optimistic update - remove file from UI immediately
    const originalFiles = [...cvFilesFromBackend];
    setCvFilesFromBackend(prev => prev.filter(f => f.id.toString() !== id));
    onRemoveBackendFile(id);
    setFileToDelete(null);
    
    // Also remove from selected if it was selected
    setSelectedBackendFiles(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    
    try {
      await deleteFile(id);
      
      // Show success notification with toast
      const fileName = fileToDelete.name;
      toast.success(`Đã xóa file "${fileName}" thành công.`);
      
      // Refresh file list after successful deletion
      await loadFiles(true);
    } catch (err) {
      // Revert optimistic update if there is an error
      setCvFilesFromBackend(originalFiles);
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa file';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error deleting file:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Cancel file deletion
  const cancelDelete = () => {
    setFileToDelete(null);
  };

  // Handle checkbox selection for backend files
  const handleBackendFileSelect = (id: string) => {
    setSelectedBackendFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Handle checkbox selection for new files
  const handleNewFileSelect = (index: number) => {
    setSelectedNewFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Handle select all checkbox
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select all files across all pages
      const backendIds = allCvFiles
        .filter(item => item.type === 'backend')
        .map(item => (item.data as CvFileFromBackend).id.toString());
      const newIndices = allCvFiles
        .filter(item => item.type === 'new')
        .map(item => item.index!);
      
      setSelectedBackendFiles(prev => {
        const newSet = new Set(prev);
        backendIds.forEach(id => newSet.add(id));
        return newSet;
      });
      setSelectedNewFiles(prev => {
        const newSet = new Set(prev);
        newIndices.forEach(index => newSet.add(index));
        return newSet;
      });
    } else {
      // Deselect all files across all pages
      setSelectedBackendFiles(new Set());
      setSelectedNewFiles(new Set());
    }
  };

  // Check if all items across all pages are selected
  const isAllSelected = () => {
    if (allCvFiles.length === 0) return false;
    return allCvFiles.every(item => {
      if (item.type === 'backend') {
        return selectedBackendFiles.has(item.data.id.toString());
      } else {
        return selectedNewFiles.has(item.index!);
      }
    });
  };

  // Get total selected count
  const getSelectedCount = () => {
    return selectedBackendFiles.size + selectedNewFiles.size;
  };

  // Clear all selections
  const handleClearSelection = () => {
    setSelectedBackendFiles(new Set());
    setSelectedNewFiles(new Set());
  };

  // Handle delete multiple selected files
  const handleDeleteSelected = () => {
    const selectedCount = getSelectedCount();
    if (selectedCount === 0) return;
    
    // Create a confirmation message
    setFileToDelete({ id: 'multiple', name: `${selectedCount} file` });
  };

  // Confirm delete multiple files
  const confirmDeleteMultiple = async () => {
    setIsDeleting(true);
    
    // Store original state for rollback
    const originalBackendFiles = [...cvFilesFromBackend];
    const filesToDelete = Array.from(selectedBackendFiles);
    const indicesToDelete = Array.from(selectedNewFiles).sort((a, b) => b - a); // Sort descending for safe deletion
    
    // Optimistic update - remove files from UI immediately
    setCvFilesFromBackend(prev => prev.filter(f => !selectedBackendFiles.has(f.id.toString())));
    
    // Remove new files
    indicesToDelete.forEach(index => {
      onRemoveNewFile(index);
    });
    
    // Clear selections
    setSelectedBackendFiles(new Set());
    setSelectedNewFiles(new Set());
    setFileToDelete(null);
    
    try {
      // Delete backend files
      const deletePromises = filesToDelete.map(id => deleteFile(id));
      await Promise.all(deletePromises);
      
      // Show success notification
      toast.success(`Đã xóa ${filesToDelete.length + indicesToDelete.length} file thành công.`);
      
      // Refresh file list after successful deletion
      await loadFiles(true);
    } catch (err) {
      // Revert optimistic update if there is an error
      setCvFilesFromBackend(originalBackendFiles);
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa file';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error deleting files:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle remove new file with selection cleanup
  const handleRemoveNewFile = (file: File) => {
    const actualIndex = cvFiles.findIndex(f => f.name === file.name && f.size === file.size);
    if (actualIndex !== -1) {
      // Remove from selected if it was selected
      setSelectedNewFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(actualIndex);
        return newSet;
      });
      onRemoveNewFile(actualIndex);
    }
  };

  return {
    // State
    currentPage,
    setCurrentPage,
    cvFilesFromBackend,
    isLoading,
    isRefreshing,
    error,
    fileToDelete,
    isDeleting,
    tableOpacity,
    selectedBackendFiles,
    selectedNewFiles,
    // Computed values
    totalCvFiles,
    totalPages,
    allCvFiles,
    paginatedCvFiles,
    // Handlers
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
  };
}

