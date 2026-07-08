import { z } from 'zod';

export const uploadedFileSchema = z.object({
  url: z.string().url(),
  fileName: z.string().optional(),
  mimeType: z.string().optional(),
  fileSize: z.number().int().positive().optional(),
});

export const createAssignmentSchema = z.object({
  lessonId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().datetime(),
  maxMarks: z.number().int().min(1),
  allowedFileTypes: z.array(z.string()).optional(),
  allowResubmission: z.boolean().optional(),
  attachments: z.array(uploadedFileSchema).optional(),
});

export const createSubmissionSchema = z.object({
  assignmentId: z.string().uuid(),
  files: z.array(uploadedFileSchema).min(1).max(5),
});

export const evaluateSubmissionSchema = z.object({
  marks: z.number().int().min(0),
  remarks: z.string().optional(),
  status: z.enum(['approved', 'rejected']),
});
