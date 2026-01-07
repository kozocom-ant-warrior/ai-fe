'use client';

import { useState } from 'react';
import { z } from 'zod';
import AdvancedOptions from './AdvancedOptions';
import FileDropzone from './FileDropzone';
import { sendThinkingRequest } from '../../api/thinking';
import Button from '../../components/Button';
import { jdInputFormSchema, parseZodErrors } from '../../schemas/jdInputSchema';
import type { FormErrors, AdvancedOptionsState } from '../../types/form.types';
import type { CvMapping } from '../../types/cv.types';
import type { JdInputSectionProps } from '../../types/component.types';

export default function JdInputSection({ onThinkingSuccess, maxCvCount = 5, onMaxCvCountChange, totalCvCount = 0 }: JdInputSectionProps) {
  const [jdFiles, setJdFiles] = useState<File[]>([]);
  const [jdInputType, setJdInputType] = useState<'text' | 'file'>('text');
  const [jdText, setJdText] = useState('');
  const [advancedOptions, setAdvancedOptions] = useState<AdvancedOptionsState>({
    scoreMatching: false,
    detectDuplicate: false,
    cvPresentation: false,
    interviewQuestions: false,
    suggestOtherRoles: false,
    certBenefit: false,
  });
  const [isThinking, setIsThinking] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleJdFilesSelected = (files: File[]) => {
    setJdFiles(prev => [...prev, ...files]);
    if (errors.jdFiles) {
      setErrors(prev => ({ ...prev, jdFiles: undefined }));
    }
  };

  const removeJdFile = (index: number) => {
    setJdFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      // If files remain after deletion, clear error
      if (newFiles.length > 0 && errors.jdFiles) {
        setErrors(prevErrors => ({ ...prevErrors, jdFiles: undefined }));
      }
      return newFiles;
    });
  };

  const handleAdvancedOptionsChange = (options: AdvancedOptionsState) => {
    setAdvancedOptions(options);
  };

  const validateForm = (): boolean => {
    try {
      const formData = {
        jdInputType,
        ...(jdInputType === 'text' 
          ? { jdText }
          : { jdFiles }
        ),
      };

      jdInputFormSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors = parseZodErrors(error);
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleThinking = async () => {
    if (!validateForm()) {
      return;
    }

    setIsThinking(true);
    try {
      // Add text about CV count to jdText if input type is text
      const finalJdText = jdInputType === 'text' 
        ? `${jdText}\n\nOnly return ${maxCvCount} CVs, no more`
        : undefined;

      const response = await sendThinkingRequest({
        jdText: finalJdText,
        jdFiles: jdInputType === 'file' ? jdFiles : undefined,
        advancedOptions,
        maxCvCount,
      });

      console.log('Thinking response:', response);
      
      // Call callback with CV mappings from response
      if (response.data?.cv_mappings && Array.isArray(response.data.cv_mappings)) {
        onThinkingSuccess?.(response.data.cv_mappings);
      } else {
        onThinkingSuccess?.([]);
      }
    } catch (error: any) {
      console.error('Error sending thinking request:', error);
      alert(error.message || 'An error occurred while sending request');
      onThinkingSuccess?.([]);
    } finally {
      setIsThinking(false);
    }
  };

  const isFormValid = () => {
    try {
      const formData = {
        jdInputType,
        ...(jdInputType === 'text' 
          ? { jdText }
          : { jdFiles }
        ),
      };
      jdInputFormSchema.parse(formData);
      return true;
    } catch {
      return false;
    }
  };

  const handleReset = () => {
    setJdFiles([]);
    setJdInputType('text');
    setJdText('');
    setAdvancedOptions({
      scoreMatching: false,
      detectDuplicate: false,
      cvPresentation: false,
      interviewQuestions: false,
      suggestOtherRoles: false,
      certBenefit: false,
    });
    setErrors({});
    onThinkingSuccess?.([]);
  };

  return (
    <div className="bg-white shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Job Description & Requirements
        </h2>
        
        <div className="space-y-6">
        {/* JD Input Type Switch */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select JD input method
          </label>
          <div className="flex items-center space-x-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="jd-input-type"
                value="text"
                checked={jdInputType === 'text'}
                onChange={(e) => setJdInputType(e.target.value as 'text' | 'file')}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 focus:ring-2"
              />
              <span className="ml-2 text-sm text-gray-700">Enter text</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="jd-input-type"
                value="file"
                checked={jdInputType === 'file'}
                onChange={(e) => setJdInputType(e.target.value as 'text' | 'file')}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 focus:ring-2"
              />
              <span className="ml-2 text-sm text-gray-700">Upload file</span>
            </label>
          </div>
        </div>

        {/* Advanced Options */}
        <AdvancedOptions onOptionsChange={handleAdvancedOptionsChange} />

        {/* JD Text Input */}
        {jdInputType === 'text' && (
          <div>
            <label
              htmlFor="jd-text"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Job Description (JD) <span className="text-red-500">*</span>
            </label>
            <div className="flex items-stretch gap-2 w-full">
              <textarea
                id="jd-text"
                value={jdText}
                onChange={(e) => {
                  setJdText(e.target.value);
                  if (errors.jdText) {
                    setErrors(prev => ({ ...prev, jdText: undefined }));
                  }
                }}
                rows={3}
                className={`flex-1 rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 transition resize-none ${
                  errors.jdText
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
                }`}
                placeholder="Enter job description here..."
              />
              {onMaxCvCountChange && (
                <div className={`flex items-center gap-1 self-stretch pl-2 pr-0 rounded-lg border flex-shrink-0 w-[90px] bg-gray-200 ${
                  errors.jdText
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}>
                  <span className="text-xs text-gray-700 flex-1 min-w-0 text-center flex flex-col items-center justify-center font-bold">
                    {maxCvCount}
                    <br />
                    CVs to return
                  </span>
                  <div className="flex flex-col gap-0.5 h-full flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const newValue = maxCvCount + 1;
                        if (totalCvCount === 0 || newValue <= totalCvCount) {
                          onMaxCvCountChange(newValue);
                        }
                      }}
                      disabled={totalCvCount === 0 || maxCvCount >= totalCvCount}
                      className="group flex items-center justify-center w-8 h-[calc(50%-2px)] rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                      aria-label="Increase value"
                    >
                      <svg className="w-3 h-3 stroke-white group-disabled:stroke-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newValue = Math.max(1, maxCvCount - 1);
                        onMaxCvCountChange(newValue);
                      }}
                      disabled={totalCvCount === 0 || maxCvCount <= 1}
                      className="group flex items-center justify-center w-8 h-[calc(50%-2px)] rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                      aria-label="Decrease value"
                    >
                      <svg className="w-3 h-3 stroke-white group-disabled:stroke-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
            {errors.jdText && (
              <p className="mt-1 text-sm text-red-600">{errors.jdText}</p>
            )}
          </div>
        )}

        {/* JD File Upload */}
        {jdInputType === 'file' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload JD <span className="text-red-500">*</span>
            </label>
            {errors.jdFiles && (
              <p className="mb-2 text-sm text-red-600">{errors.jdFiles}</p>
            )}
            <FileDropzone
              onFilesSelected={handleJdFilesSelected}
              files={jdFiles}
              onRemoveFile={removeJdFile}
              placeholderText="Drag and drop or select JD file"
              draggingText="Drop file here"
              fileTypesText="DOC, DOCX, PDF (MAX. 10MB per file)"
              disabled={isThinking}
            />
          </div>
        )}

        {/* Thinking and Reset Buttons */}
        <div className="flex gap-3">
          <Button
            text="Thinking"
            onClick={handleThinking}
            disabled={isThinking || !isFormValid()}
            isLoading={isThinking}
            loadingText="Processing..."
            fullWidth={true}
            variant="primary"
          />
          <Button
            text="Reset"
            onClick={handleReset}
            disabled={isThinking}
            fullWidth={true}
            variant="secondary"
          />
        </div>
      </div>
    </div>
  );
}

