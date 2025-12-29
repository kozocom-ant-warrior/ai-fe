import { z } from 'zod';

// Schema cho input type text
export const textInputSchema = z.object({
  jdInputType: z.literal('text'),
  jdText: z.string().min(1, 'Mô tả công việc (JD) là bắt buộc'),
  responseRequirement: z.string().min(1, 'Yêu cầu response là bắt buộc'),
});

// Schema cho input type file
export const fileInputSchema = z.object({
  jdInputType: z.literal('file'),
  jdFiles: z.array(z.instanceof(File)).min(1, 'Vui lòng upload ít nhất một file JD'),
  responseRequirement: z.string().min(1, 'Yêu cầu response là bắt buộc'),
});

// Schema chính sử dụng discriminated union
export const jdInputFormSchema = z.discriminatedUnion('jdInputType', [
  textInputSchema,
  fileInputSchema,
]);

// Type inference từ schema
export type JdInputFormData = z.infer<typeof jdInputFormSchema>;
export type TextInputFormData = z.infer<typeof textInputSchema>;
export type FileInputFormData = z.infer<typeof fileInputSchema>;

// Helper function để parse errors từ ZodError
export interface FormErrors {
  jdText?: string;
  jdFiles?: string;
  responseRequirement?: string;
}

export const parseZodErrors = (error: z.ZodError): FormErrors => {
  const errors: FormErrors = {};
  
  error.issues.forEach((issue) => {
    const path = issue.path[0] as string;
    if (path === 'jdText') {
      errors.jdText = issue.message;
    } else if (path === 'jdFiles') {
      errors.jdFiles = issue.message;
    } else if (path === 'responseRequirement') {
      errors.responseRequirement = issue.message;
    }
  });

  return errors;
};

