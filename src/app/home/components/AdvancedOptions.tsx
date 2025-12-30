'use client';

import { useState } from 'react';

export interface AdvancedOptionsState {
  scoreMatching: boolean;
  detectDuplicate: boolean;
  cvPresentation: boolean;
  interviewQuestions: boolean;
  suggestOtherRoles: boolean;
  certBenefit: boolean;
}

interface AdvancedOptionsProps {
  onOptionsChange?: (options: AdvancedOptionsState) => void;
}

export default function AdvancedOptions({ onOptionsChange }: AdvancedOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<AdvancedOptionsState>({
    scoreMatching: false,
    detectDuplicate: false,
    cvPresentation: false,
    interviewQuestions: false,
    suggestOtherRoles: false,
    certBenefit: false,
  });

  const handleOptionChange = (key: keyof AdvancedOptionsState) => {
    const newOptions = {
      ...options,
      [key]: !options[key],
    };
    setOptions(newOptions);
    onOptionsChange?.(newOptions);
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-sm font-medium text-gray-700">Nâng cao</span>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform duration-300 ease-in-out ${
            isOpen ? 'transform rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'
        }`}
      >
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={options.detectDuplicate}
              onChange={() => handleOptionChange('detectDuplicate')}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
            />
            <span className="ml-3 text-sm text-gray-700">
              So khớp trùng lặp / giả mạo
            </span>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={options.cvPresentation}
              onChange={() => handleOptionChange('cvPresentation')}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
            />
            <span className="ml-3 text-sm text-gray-700">
              Trình bày CV (độ chuyên nghiệp)
            </span>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={options.interviewQuestions}
              onChange={() => handleOptionChange('interviewQuestions')}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
            />
            <span className="ml-3 text-sm text-gray-700">
              Câu hỏi phỏng vấn theo level
            </span>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={options.suggestOtherRoles}
              onChange={() => handleOptionChange('suggestOtherRoles')}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
            />
            <span className="ml-3 text-sm text-gray-700">
              CV fail → gợi ý role khác
            </span>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={options.certBenefit}
              onChange={() => handleOptionChange('certBenefit')}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
            />
            <span className="ml-3 text-sm text-gray-700">
              Cert ↔ Benefit
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

