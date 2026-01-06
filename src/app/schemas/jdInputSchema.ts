import { z } from 'zod';

// Schema for text input type
export const textInputSchema = z.object({
  jdInputType: z.literal('text'),
  jdText: z.string().min(1, 'Mô tả công việc (JD) là bắt buộc'),
});

// Schema for file input type
export const fileInputSchema = z.object({
  jdInputType: z.literal('file'),
  jdFiles: z.array(z.instanceof(File)).min(1, 'Vui lòng upload ít nhất một file JD'),
});

// Main schema using discriminated union
export const jdInputFormSchema = z.discriminatedUnion('jdInputType', [
  textInputSchema,
  fileInputSchema,
]);

// Type inference from schema
export type JdInputFormData = z.infer<typeof jdInputFormSchema>;
export type TextInputFormData = z.infer<typeof textInputSchema>;
export type FileInputFormData = z.infer<typeof fileInputSchema>;

import type { FormErrors } from '../types/form.types';

export type { FormErrors };

export const parseZodErrors = (error: z.ZodError): FormErrors => {
  const errors: FormErrors = {};
  
  error.issues.forEach((issue) => {
    const path = issue.path[0] as string;
    if (path === 'jdText') {
      errors.jdText = issue.message;
    } else if (path === 'jdFiles') {
      errors.jdFiles = issue.message;
    }
  });

  return errors;
};

