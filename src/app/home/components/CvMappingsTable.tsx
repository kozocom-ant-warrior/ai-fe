'use client';

import type { CvMapping, CvMappingsTableProps } from '../../types/cv.types';
import { envConfig } from '@/configs/env';

// Get CV view base URL from environment config
const CV_VIEW_BASE_URL = envConfig.apiBaseUrl;

export default function CvMappingsTable({ cvMappings }: CvMappingsTableProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-blue-600 bg-blue-50';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Kết quả Matching CV ({cvMappings.length})
      </h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ứng viên
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thông tin
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kỹ năng
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Điểm số
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Đánh giá
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cvMappings.map((cv) => (
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
                        aria-label="Mở CV trong tab mới"
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
                      {cv.experience_years} năm kinh nghiệm
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
                    {cv.skills.slice(0, 6).map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {skill}
                      </span>
                    ))}
                    {cv.skills.length > 6 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                        +{cv.skills.length - 6}
                      </span>
                    )}
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
                        ✓ {cv.scope.matched_requirements.length} phù hợp
                      </div>
                      {cv.scope.missing_requirements.length > 0 && (
                        <div className="text-red-600">
                          ✗ {cv.scope.missing_requirements.length} thiếu
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
                        <div className="text-xs font-medium text-gray-600 mb-1">
                          Phù hợp:
                        </div>
                        <ul className="text-xs text-gray-500 space-y-1">
                          {cv.scope.matched_requirements.slice(0, 3).map((req, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-green-500 mr-1">✓</span>
                              <span>{req}</span>
                            </li>
                          ))}
                          {cv.scope.matched_requirements.length > 3 && (
                            <li className="text-gray-400">
                              +{cv.scope.matched_requirements.length - 3} yêu cầu khác
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                    {cv.scope.missing_requirements.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs font-medium text-gray-600 mb-1">
                          Thiếu:
                        </div>
                        <ul className="text-xs text-gray-500 space-y-1">
                          {cv.scope.missing_requirements.map((req, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-red-500 mr-1">✗</span>
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                      {cv.duplicate_warning == '1' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2">
                          <div className="text-xs font-medium text-yellow-800 mb-1">
                            ⚠ Cảnh báo trùng lặp:
                          </div>
                          <div className="text-xs text-yellow-700">
                            {cv.duplicate_warning}
                          </div>
                        </div>
                      )}
                      
                      {cv.cv_presentation_comment && (
                        <div>
                          <div className="text-xs font-medium text-gray-600 mb-1">
                            Nhận xét CV:
                          </div>
                          <div className="text-xs text-gray-500">
                            {cv.cv_presentation_comment}
                          </div>
                        </div>
                      )}
                      
                      {cv.suggested_roles && cv.suggested_roles.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-gray-600 mb-1">
                            Vị trí đề xuất:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {cv.suggested_roles.map((role, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800"
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {cv.cert_comment && (
                        <div>
                          <div className="text-xs font-medium text-gray-600 mb-1">
                            Nhận xét chứng chỉ:
                          </div>
                          <div className="text-xs text-gray-500">
                            {cv.cert_comment}
                          </div>
                        </div>
                      )}
                      
                      {cv.interview_questions && cv.interview_questions.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-gray-600 mb-1">
                            Câu hỏi phỏng vấn đề xuất:
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


