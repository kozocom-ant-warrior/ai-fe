// Thinking API related types
import type { AdvancedOptionsState } from './form.types';

export interface ThinkingRequest {
  jdText?: string;
  jdFiles?: File[];
  advancedOptions: AdvancedOptionsState;
  maxCvCount?: number;
}

export interface ThinkingResponse {
  success: boolean;
  data?: any;
  message?: string;
}

