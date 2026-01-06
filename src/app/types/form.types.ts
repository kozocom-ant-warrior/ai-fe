// Form related types

export interface AdvancedOptionsState {
  scoreMatching: boolean;
  detectDuplicate: boolean;
  cvPresentation: boolean;
  interviewQuestions: boolean;
  suggestOtherRoles: boolean;
  certBenefit: boolean;
}

export interface FormErrors {
  jdText?: string;
  jdFiles?: string;
  responseRequirement?: string;
}

