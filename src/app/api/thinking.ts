import axios from 'axios';
import { AdvancedOptionsState } from '../home/components/AdvancedOptions';

// Axios instance với base URL từ biến môi trường
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// Interface cho request data
export interface ThinkingRequest {
  jdText?: string;
  jdFiles?: File[];
  responseRequirement: string;
  advancedOptions: AdvancedOptionsState;
}

// Interface cho response từ API /thinking
export interface ThinkingResponse {
  success: boolean;
  data?: any;
  message?: string;
}

/**
 * Gửi yêu cầu thinking lên API
 * @param requestData Dữ liệu request bao gồm JD text/files, response requirement và advanced options
 * @returns Promise<ThinkingResponse> Response từ API
 */
export async function sendThinkingRequest(
  requestData: ThinkingRequest
): Promise<ThinkingResponse> {
  try {
    // Chuẩn bị FormData
    const formData = new FormData();

    // Thêm JD text hoặc files
    if (requestData.jdText) {
      formData.append('jd_text', requestData.jdText);
    } else if (requestData.jdFiles && requestData.jdFiles.length > 0) {
      requestData.jdFiles.forEach((file) => {
        formData.append('jd_files', file);
      });
    }

    // Thêm response requirement
    formData.append('response_requirement', requestData.responseRequirement);

    // Thêm advanced options
    formData.append('advanced_options', JSON.stringify(requestData.advancedOptions));

    // Gửi request
    const { data } = await apiClient.post('/thinking', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      success: true,
      data,
    };
  } catch (err: any) {
    console.error('Error sending thinking request:', err);
    throw new Error(
      err.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu thinking'
    );
  }
}

