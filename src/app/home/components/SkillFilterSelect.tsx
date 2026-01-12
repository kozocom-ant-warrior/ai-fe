'use client';

import Select from 'react-select';

export interface SkillOption {
  value: string;
  label: string;
}

interface SkillFilterSelectProps {
  allSkills: SkillOption[];
  selectedSkills: SkillOption[];
  onSkillsChange: (skills: SkillOption[]) => void;
  onSearch: () => void;
  appliedSkills: string[];
  onClearFilter: () => void;
}

export default function SkillFilterSelect({
  allSkills,
  selectedSkills,
  onSkillsChange,
  onSearch,
  appliedSkills,
  onClearFilter,
}: SkillFilterSelectProps) {
  return (
    <div className="mb-4">
      <label htmlFor="skill-filter" className="block text-sm font-medium text-gray-700 mb-2">
        Filter by skills:
      </label>
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <Select
            id="skill-filter"
            isMulti
            options={allSkills}
            value={selectedSkills}
            onChange={(newValue) => {
              const newSelected = (newValue as SkillOption[]) || [];
              onSkillsChange(newSelected);
            }}
            placeholder="Select skills..."
            className="text-sm"
            classNamePrefix="select"
            noOptionsMessage={() => 'No skills found'}
            styles={{
              control: (base) => ({
                ...base,
                borderColor: '#d1d5db',
                boxShadow: 'none',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: '#9ca3af',
                },
              }),
              option: (base) => ({
                ...base,
                cursor: 'pointer',
              }),
              multiValue: (base) => ({
                ...base,
                backgroundColor: '#e0e7ff',
              }),
              multiValueLabel: (base) => ({
                ...base,
                color: '#4338ca',
                cursor: 'pointer',
              }),
              multiValueRemove: (base) => ({
                ...base,
                color: '#4338ca',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: '#c7d2fe',
                  color: '#4338ca',
                },
              }),
              indicatorSeparator: (base) => ({
                ...base,
                cursor: 'pointer',
              }),
              dropdownIndicator: (base) => ({
                ...base,
                cursor: 'pointer',
              }),
              clearIndicator: (base) => ({
                ...base,
                cursor: 'pointer',
              }),
            }}
          />
        </div>
        <button
          onClick={onSearch}
          disabled={selectedSkills.length === 0}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer text-sm font-medium transition-colors whitespace-nowrap"
        >
          Search
        </button>
      </div>
      {appliedSkills.length > 0 && (
        <div className="mt-2 flex items-center gap-3">
          <span className="text-xs text-gray-500">
            Filtering: {appliedSkills.length} skill(s)
          </span>
          <button
            onClick={onClearFilter}
            className="text-xs text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
          >
            Clear filter
          </button>
        </div>
      )}
    </div>
  );
}

