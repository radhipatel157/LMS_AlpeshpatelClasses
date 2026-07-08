import { z } from 'zod';

export const createStandardSchema = z.object({
  name: z.string().min(1),
  order: z.number().int().min(0).optional(),
});

export const createSubjectSchema = z.object({
  standardId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  order: z.number().int().min(0).optional(),
});

export const createChapterSchema = z.object({
  subjectId: z.string().uuid(),
  name: z.string().min(1),
  order: z.number().int().min(0).optional(),
});

export const createLessonSchema = z.object({
  chapterId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  order: z.number().int().min(0).optional(),
});

export const reorderSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
});
