import { z } from 'zod';

export const createVideoSchema = z.object({
  lessonId: z.string().uuid(),
  title: z.string().min(1),
  youtubeIdOrUrl: z.string().min(1),
  thumbnailUrl: z.string().url().optional(),
  duration: z.number().int().min(1),
  order: z.number().int().min(0).optional(),
});

export const videoHeartbeatSchema = z.object({
  videoId: z.string().uuid(),
  currentPosition: z.number().int().min(0),
  watchedSeconds: z.number().int().min(0),
  completionPercentage: z.number().min(0).max(100),
  sessionId: z.string().min(1),
});
