// Thinking API related types
import type { AdvancedOptionsState } from './form.types';

export interface ThinkingRequest {
  jdText?: string;
  jdFiles?: File[];
  responseRequirement: string;
  advancedOptions: AdvancedOptionsState;
}

export interface ThinkingResponse {
  success: boolean;
  data?: any;
  message?: string;
}

