'use client';

import { useState } from 'react';
import { z } from 'zod';
import AdvancedOptions, { AdvancedOptionsState } from './AdvancedOptions';
import { sendThinkingRequest } from '../../api/thinking';
import Button from '../../components/Button';
import { jdInputFormSchema, parseZodErrors, type FormErrors } from '../../schemas/jdInputSchema';
import { type CvMapping } from './CvMappingsTable';

interface JdInputSectionProps {
  onThinkingSuccess?: (cvMappings: CvMapping[]) => void;
}

export default function JdInputSection({ onThinkingSuccess }: JdInputSectionProps) {
  const [jdFiles, setJdFiles] = useState<File[]>([]);
  const [jdInputType, setJdInputType] = useState<'text' | 'file'>('text');
  const [jdText, setJdText] = useState('');
  const [responseRequirement, setResponseRequirement] = useState('');
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

  const handleJdFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = selectedFiles.filter(file => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        return ['doc', 'docx', 'pdf'].includes(extension || '');
      });
      setJdFiles(prev => [...prev, ...validFiles]);
      if (errors.jdFiles) {
        setErrors(prev => ({ ...prev, jdFiles: undefined }));
      }
    }
  };

  const removeJdFile = (index: number) => {
    setJdFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      // Nếu còn file sau khi xóa, xóa lỗi
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
          ? { jdText, responseRequirement }
          : { jdFiles, responseRequirement }
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
        responseRequirement,
        advancedOptions,
      });

      console.log('Thinking response:', response);
      
      // Gọi callback với CV mappings từ response
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
          ? { jdText, responseRequirement }
          : { jdFiles, responseRequirement }
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
    setResponseRequirement('');
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
            <div className="mb-4">
              <label
                htmlFor="jd-file-upload"
                className="flex flex-col items-center justify-center w-full h-30 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-10 h-10 mb-3 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click để upload</span> hoặc kéo thả
                  </p>
                  <p className="text-xs text-gray-500">
                    DOC, DOCX, PDF (MAX. 10MB mỗi file)
                  </p>
                </div>
                <input
                  id="jd-file-upload"
                  type="file"
                  className="hidden"
                  multiple
                  accept=".doc,.docx,.pdf"
                  onChange={handleJdFileChange}
                />
              </label>
            </div>

            {/* File List */}
            {jdFiles.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Files đã upload ({jdFiles.length})
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {jdFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <svg
                          className="w-5 h-5 text-indigo-600 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span className="text-sm text-gray-700 truncate">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <button
                        onClick={() => removeJdFile(index)}
                        className="ml-2 text-red-600 hover:text-red-800 transition"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Response Requirement Input */}
        <div>
          <label
            htmlFor="response-requirement"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Yêu cầu response <span className="text-red-500">*</span>
          </label>
          <textarea
            id="response-requirement"
            value={responseRequirement}
            onChange={(e) => {
              setResponseRequirement(e.target.value);
              if (errors.responseRequirement) {
                setErrors(prev => ({ ...prev, responseRequirement: undefined }));
              }
            }}
            rows={3}
            className={`w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 transition resize-none ${
              errors.responseRequirement
                ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
            }`}
            placeholder="Ví dụ: 'Trả về 2 CV phù hợp với JD', 'Sắp xếp mức độ phù hợp của CV với JD theo thứ tự giảm dần', 'Trả về CV phù hợp với JD và có điểm tương đồng cao nhất', ..."
          />
          {errors.responseRequirement && (
            <p className="mt-1 text-sm text-red-600">{errors.responseRequirement}</p>
          )}
        </div>

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

