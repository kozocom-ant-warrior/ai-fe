'use client';

interface CvMapping {
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
}

interface CvMappingsTableProps {
  cvMappings: CvMapping[];
}

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
                    <div className="text-sm font-medium text-gray-900">
                      {cv.candidate_name}
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

export type { CvMapping };

