// CV related types

export interface CvPresentationComment {
  structure: string;
  strengths: string[];
  issues: string[];
  highlights: string;
  suggestions: string[];
}

export interface CvMapping {
  cv_id: string;
  candidate_name: string;
  email: string;
  phone: string;
  position: string;
  experience_years: number;
  skills: string[];
  education: {
    degree: string;
    university: string;
    graduation_year: number;
  };
  scope: {
    score: number;
    matched_requirements: string[];
    missing_requirements: string[];
  };
  mapping_description: string;
  duplicate_warning: string | null;
  cv_presentation_comment: string | CvPresentationComment;
  interview_questions: string[];
  job_leveling: string[];
  job_leveling_reason?: string;
  cert_comment: string;
  file_id: number;
}

export interface CvMappingsTableProps {
  cvMappings: CvMapping[];
}

