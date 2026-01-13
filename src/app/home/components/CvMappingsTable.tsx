'use client';

import { useState, useMemo } from 'react';
import type { CvMapping, CvMappingsTableProps } from '../../types/cv.types';
import { envConfig } from '@/configs/env';
import SkillFilterSelect, { type SkillOption } from './SkillFilterSelect';

// Get CV view base URL from environment config
const CV_VIEW_BASE_URL = envConfig.apiBaseUrl;

export default function CvMappingsTable({ cvMappings }: CvMappingsTableProps) {
  const [expandedMatched, setExpandedMatched] = useState<Set<string>>(new Set());
  const [expandedMissing, setExpandedMissing] = useState<Set<string>>(new Set());
  const [selectedSkills, setSelectedSkills] = useState<SkillOption[]>([]);
  const [appliedSkills, setAppliedSkills] = useState<string[]>([]);

  // Collect all unique skills from all CVs
  const allSkills = useMemo(() => {
    const skillsSet = new Set<string>();
    cvMappings.forEach((cv) => {
      cv.skills.forEach((skill) => {
        skillsSet.add(skill);
      });
    });
    return Array.from(skillsSet).sort().map((skill) => ({
      value: skill,
      label: skill,
    }));
  }, [cvMappings]);

  // Filter CVs based on applied skills
  const filteredCvMappings = useMemo(() => {
    if (appliedSkills.length === 0) {
      return cvMappings;
    }
    return cvMappings.filter((cv) => {
      return appliedSkills.some((skill) => cv.skills.includes(skill));
    });
  }, [cvMappings, appliedSkills]);

  const handleSearch = () => {
    setAppliedSkills(selectedSkills.map((option) => option.value));
  };

  const handleClearFilter = () => {
    setSelectedSkills([]);
    setAppliedSkills([]);
  };

  const handleSkillsChange = (newSelected: SkillOption[]) => {
    setSelectedSkills(newSelected);
    // If all are removed, also clear the applied filter
    if (newSelected.length === 0) {
      setAppliedSkills([]);
    }
  };

  const toggleMatched = (cvId: string) => {
    setExpandedMatched((prev) => {
      const next = new Set(prev);
      if (next.has(cvId)) {
        next.delete(cvId);
      } else {
        next.add(cvId);
      }
      return next;
    });
  };

  const toggleMissing = (cvId: string) => {
    setExpandedMissing((prev) => {
      const next = new Set(prev);
      if (next.has(cvId)) {
        next.delete(cvId);
      } else {
        next.add(cvId);
      }
      return next;
    });
  };
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-blue-600 bg-blue-50';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          CV Matching Results ({filteredCvMappings.length}/{cvMappings.length})
        </h2>
      </div>
      
      <SkillFilterSelect
        allSkills={allSkills}
        selectedSkills={selectedSkills}
        onSkillsChange={handleSkillsChange}
        onSearch={handleSearch}
        appliedSkills={appliedSkills}
        onClearFilter={handleClearFilter}
      />
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Candidate
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Information
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Skills
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Evaluation
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCvMappings.map((cv) => (
              <tr key={cv.cv_id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <a
                        href={`${CV_VIEW_BASE_URL}/cv/view/${cv.file_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline"
                      >
                        {cv.candidate_name}
                      </a>
                      <a
                        href={`${CV_VIEW_BASE_URL}/cv/view/${cv.file_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        aria-label="Open CV in new tab"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </div>
                    <div className="text-xs text-gray-500">{cv.email}</div>
                    <div className="text-xs text-gray-500">{cv.phone}</div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900">
                    <div className="font-medium">{cv.position}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {cv.experience_years} years of experience
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {cv.education.degree}
                    </div>
                    <div className="text-xs text-gray-500">
                      {cv.education.university} ({cv.education.graduation_year})
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {cv.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex flex-col items-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(
                        cv.scope.score
                      )}`}
                    >
                      {cv.scope.score}/100
                    </span>
                    <div className="mt-2 text-xs text-gray-500">
                      <div className="text-green-600">
                        ✓ {cv.scope.matched_requirements.length} matched
                      </div>
                      {cv.scope.missing_requirements.length > 0 && (
                        <div className="text-red-600">
                          ✗ {cv.scope.missing_requirements.length} missing
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-700 max-w-md">
                    <p className="mb-2">{cv.mapping_description}</p>
                    {cv.scope.matched_requirements.length > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-xs font-medium text-gray-600">
                            Matched:
                          </div>
                          {cv.scope.matched_requirements.length > 3 && (
                            <button
                              onClick={() => toggleMatched(cv.cv_id)}
                              className="text-xs text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                            >
                              {expandedMatched.has(cv.cv_id) ? 'Collapse' : `View all (${cv.scope.matched_requirements.length})`}
                            </button>
                          )}
                        </div>
                        <ul className="text-xs text-gray-500 space-y-1">
                          {(expandedMatched.has(cv.cv_id)
                            ? cv.scope.matched_requirements
                            : cv.scope.matched_requirements.slice(0, 3)
                          ).map((req, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-green-500 mr-1">✓</span>
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {cv.scope.missing_requirements.length > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-xs font-medium text-gray-600">
                            Missing:
                          </div>
                          {cv.scope.missing_requirements.length > 3 && (
                            <button
                              onClick={() => toggleMissing(cv.cv_id)}
                              className="text-xs text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                            >
                              {expandedMissing.has(cv.cv_id) ? 'Collapse' : `View all (${cv.scope.missing_requirements.length})`}
                            </button>
                          )}
                        </div>
                        <ul className="text-xs text-gray-500 space-y-1">
                          {(expandedMissing.has(cv.cv_id)
                            ? cv.scope.missing_requirements
                            : cv.scope.missing_requirements.slice(0, 3)
                          ).map((req, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-red-500 mr-1">✗</span>
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                      {/* {cv.duplicate_warning == '1' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2">
                          <div className="text-xs font-medium text-yellow-800 mb-1">
                            ⚠ Duplicate warning:
                          </div>
                          <div className="text-xs text-yellow-700">
                            {cv.duplicate_warning}
                          </div>
                        </div>
                      )} */}
                      
                      {cv.cv_presentation_comment && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                            <span>📋</span> CV Analysis
                          </div>
                          {typeof cv.cv_presentation_comment === 'string' ? (
                            <div className="text-xs text-gray-600">
                              {cv.cv_presentation_comment}
                            </div>
                          ) : (
                            <div className="text-xs space-y-3">
                              {/* Structure */}
                              <div className="bg-white rounded p-2">
                                <div className="font-semibold text-blue-700 mb-1">📐 Structure</div>
                                <div className="text-gray-600 leading-relaxed">{cv.cv_presentation_comment.structure}</div>
                              </div>
                              
                              {/* Strengths */}
                              <div className="bg-white rounded p-2">
                                <div className="font-semibold text-green-700 mb-1">✅ Strengths</div>
                                <ul className="space-y-1">
                                  {cv.cv_presentation_comment.strengths.map((s, i) => (
                                    <li key={i} className="text-gray-600 leading-relaxed flex items-start gap-2">
                                      <span className="text-green-500 mt-0.5">•</span>
                                      <span>{s}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              {/* Issues */}
                              <div className="bg-white rounded p-2">
                                <div className="font-semibold text-red-700 mb-1">⚠️ Issues</div>
                                <ul className="space-y-1">
                                  {cv.cv_presentation_comment.issues.map((issue, i) => (
                                    <li key={i} className="text-gray-600 leading-relaxed flex items-start gap-2">
                                      <span className="text-red-500 mt-0.5">•</span>
                                      <span>{issue}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              {/* Highlights */}
                              <div className="bg-white rounded p-2">
                                <div className="font-semibold text-yellow-700 mb-1">⭐ Highlights</div>
                                <div className="text-gray-600 leading-relaxed">{cv.cv_presentation_comment.highlights}</div>
                              </div>
                              
                              {/* Suggestions */}
                              <div className="bg-white rounded p-2">
                                <div className="font-semibold text-purple-700 mb-1">💡 Suggestions</div>
                                <ul className="space-y-1">
                                  {cv.cv_presentation_comment.suggestions.map((sug, i) => (
                                    <li key={i} className="text-gray-600 leading-relaxed flex items-start gap-2">
                                      <span className="text-purple-500 mt-0.5">•</span>
                                      <span>{sug}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {cv.job_leveling && (
                        <div>
                          <div className="text-xs font-medium text-gray-600 mb-1">
                            Job Leveling:
                          </div>
                          <div className="text-xs text-gray-500">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                {Array.isArray(cv.job_leveling) ? cv.job_leveling.join(' → ') : cv.job_leveling}
                              </span>
                              {cv.job_leveling_reason && (
                                <span className="text-gray-400 cursor-help" title={cv.job_leveling_reason}>
                                  ℹ️
                                </span>
                              )}
                            </div>
                            {cv.job_leveling_reason && (
                              <div className="mt-1 text-xs text-gray-500 italic">
                                {cv.job_leveling_reason}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {cv.cert_comment && (
                        <div>
                          <div className="text-xs font-medium text-gray-600 mb-1">
                            Certificate Comments:
                          </div>
                          <div className="text-xs text-gray-500">
                            <span className="text-blue-500 mr-1">•</span>
                            {cv.cert_comment}
                          </div>
                        </div>
                      )}
                      
                      {cv.interview_questions && cv.interview_questions.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-gray-600 mb-1">
                            Suggested Interview Questions:
                          </div>
                          <ul className="text-xs text-gray-500 space-y-1">
                            {cv.interview_questions.map((question, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="text-blue-500 mr-1">•</span>
                                <span>{question}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


