'use client';

import { useState, useMemo } from 'react';
import type { AdvancedOptionsState } from '../../types/form.types';
import type { AdvancedOptionsProps } from '../../types/component.types';

export type { AdvancedOptionsState };

export default function AdvancedOptions({ onOptionsChange }: AdvancedOptionsProps) {
  const [options, setOptions] = useState<AdvancedOptionsState>({
    scoreMatching: false,
    cvPresentation: false,
    interviewQuestions: false,
    jobLeveling: false,
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
      cvPresentation: newValue,
      interviewQuestions: newValue,
      jobLeveling: newValue,
      certBenefit: newValue,
    };
    setOptions(newOptions);
    onOptionsChange?.(newOptions);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-700">Advanced</span>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={allChecked}
            onChange={handleCheckAll}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">
            Select all
          </span>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={options.cvPresentation}
              onChange={() => handleOptionChange('cvPresentation')}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
            />
            <span className="ml-3 text-sm text-gray-700">
              CV presentation (professionalism)
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
              Interview questions by level
            </span>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={options.jobLeveling}
              onChange={() => handleOptionChange('jobLeveling')}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
            />
            <span className="ml-3 text-sm text-gray-700">
              Job leveling
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

