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

export default function JdInputSection({ onThinkingSuccess }: JdInputSectionProps) {
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
      const response = await sendThinkingRequest({
        jdText: jdInputType === 'text' ? jdText : undefined,
        jdFiles: jdInputType === 'file' ? jdFiles : undefined,
        advancedOptions,
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
      alert(error.message || 'Có lỗi xảy ra khi gửi yêu cầu');
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
    <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Job Description & Yêu cầu
        </h2>
        
        <div className="space-y-6">
        {/* JD Input Type Switch */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Chọn cách nhập JD
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
              <span className="ml-2 text-sm text-gray-700">Nhập text</span>
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
              Mô tả công việc (JD) <span className="text-red-500">*</span>
            </label>
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
              className={`w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 transition resize-none ${
                errors.jdText
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
              }`}
              placeholder="Nhập mô tả công việc tại đây..."
            />
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
              placeholderText="Kéo thả hoặc chọn file JD"
              draggingText="Thả file vào đây"
              fileTypesText="DOC, DOCX, PDF (MAX. 10MB mỗi file)"
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
            loadingText="Đang xử lý..."
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

