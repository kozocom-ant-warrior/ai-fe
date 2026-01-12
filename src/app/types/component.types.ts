// Component prop types
import type { CvFileFromBackend } from './file.types';
import type { CvMapping } from './cv.types';
import type { AdvancedOptionsState } from './form.types';

export interface ButtonProps {
  text: string;
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  detailText?: string;
  warningText?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  confirmButtonColor?: 'red' | 'blue' | 'green';
}

export interface UploadCvSectionProps {
  onUpload: (files: File[]) => void;
  onUploadSuccess?: () => void;
}

export interface CvFilesTableProps {
  cvFilesFromBackend?: CvFileFromBackend[];
  cvFiles: File[];
  onRemoveBackendFile: (id: string) => void;
  onRemoveNewFile: (index: number) => void;
  itemsPerPage?: number;
  refreshTrigger?: number; // Trigger to refresh data when upload succeeds
}

export interface JdInputSectionProps {
  onThinkingSuccess?: (cvMappings: CvMapping[]) => void;
  maxCvCount?: number;
  onMaxCvCountChange?: (count: number) => void;
  totalCvCount?: number;
}

export interface AdvancedOptionsProps {
  onOptionsChange?: (options: AdvancedOptionsState) => void;
}

