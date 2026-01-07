'use client';

import { useState, useMemo } from 'react';
import type { AdvancedOptionsState } from '../../types/form.types';
import type { AdvancedOptionsProps } from '../../types/component.types';

export type { AdvancedOptionsState };

export default function AdvancedOptions({ onOptionsChange }: AdvancedOptionsProps) {
  const [options, setOptions] = useState<AdvancedOptionsState>({
    scoreMatching: false,
    detectDuplicate: false,
    cvPresentation: false,
    interviewQuestions: false,
    suggestOtherRoles: false,
    certBenefit: false,
  });

  const allChecked = useMemo(() => {
    return Object.values(options).every(value => value === true);
  }, [options]);

  const handleOptionChange = (key: keyof AdvancedOptionsState) => {
    const newOptions = {
      ...options,
      [key]: !options[key],
    };
    setOptions(newOptions);
    onOptionsChange?.(newOptions);
  };

  const handleCheckAll = () => {
    const newValue = !allChecked;
    const newOptions: AdvancedOptionsState = {
      scoreMatching: newValue,
      detectDuplicate: newValue,
      cvPresentation: newValue,
      interviewQuestions: newValue,
      suggestOtherRoles: newValue,
      certBenefit: newValue,
    };
    setOptions(newOptions);
    onOptionsChange?.(newOptions);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-700">Nâng cao</span>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={allChecked}
            onChange={handleCheckAll}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">
            Chọn tất cả
          </span>
        </label>
      </div>

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
  );
}

