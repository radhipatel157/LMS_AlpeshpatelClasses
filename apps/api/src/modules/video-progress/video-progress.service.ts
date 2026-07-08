import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { VideoHeartbeatDto } from '../videos/dto/video.dto';
import { VIDEO_COMPLETION_THRESHOLD } from '@myclass/shared';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class VideoProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async handleHeartbeat(studentId: string, dto: VideoHeartbeatDto) {
    const video = await this.prisma.video.findFirst({ where: { id: dto.videoId, deletedAt: null } });
    if (!video) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Video not found' });

    const isCompleted = dto.completionPercentage >= VIDEO_COMPLETION_THRESHOLD;

    // 1. Upsert VideoProgress
    const progress = await this.prisma.videoProgress.upsert({
      where: {
        studentId_videoId: {
          studentId,
          videoId: dto.videoId,
        },
      },
      update: {
        watchedSeconds: { increment: dto.watchedSeconds },
        completionPercentage: new Decimal(Math.min(100, Math.max(0, dto.completionPercentage))),
        lastPosition: dto.currentPosition,
        isCompleted: isCompleted ? true : undefined, // Keep true if already true
        lastWatchedAt: new Date(),
      },
      create: {
        studentId,
        videoId: dto.videoId,
        watchedSeconds: dto.watchedSeconds,
        completionPercentage: new Decimal(Math.min(100, Math.max(0, dto.completionPercentage))),
        lastPosition: dto.currentPosition,
        isCompleted,
        lastWatchedAt: new Date(),
      },
    });

    // 2. Track Granular watch session
    const existingSession = await this.prisma.watchSession.findFirst({
      where: { sessionId: dto.sessionId, studentId, videoId: dto.videoId },
    });

    if (existingSession) {
      await this.prisma.watchSession.update({
        where: { id: existingSession.id },
        data: {
          endPosition: dto.currentPosition,
          watchedSeconds: { increment: dto.watchedSeconds },
          endedAt: new Date(),
        },
      });
    } else {
      await this.prisma.watchSession.create({
        data: {
          progressId: progress.id,
          studentId,
          videoId: dto.videoId,
          sessionId: dto.sessionId,
          startPosition: Math.max(0, dto.currentPosition - dto.watchedSeconds),
          endPosition: dto.currentPosition,
          watchedSeconds: dto.watchedSeconds,
          startedAt: new Date(Date.now() - dto.watchedSeconds * 1000),
          endedAt: new Date(),
        },
      });
    }

    return progress;
  }

  async getProgressForVideo(studentId: string, videoId: string) {
    const progress = await this.prisma.videoProgress.findUnique({
      where: { studentId_videoId: { studentId, videoId } },
    });
    if (!progress) {
      return {
        watchedSeconds: 0,
        completionPercentage: 0,
        lastPosition: 0,
        isCompleted: false,
        lastWatchedAt: null,
      };
    }
    return progress;
  }

  async getWatchHistory(studentId: string) {
    return this.prisma.videoProgress.findMany({
      where: { studentId },
      include: {
        video: {
          include: {
            lesson: {
              include: {
                chapter: {
                  include: {
                    subject: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { lastWatchedAt: 'desc' },
    });
  }

  async getContinueWatching(studentId: string) {
    // In-progress means lastPosition > 0 and isCompleted is false
    return this.prisma.videoProgress.findMany({
      where: {
        studentId,
        lastPosition: { gt: 0 },
        isCompleted: false,
      },
      include: {
        video: {
          include: {
            lesson: {
              include: {
                chapter: {
                  include: {
                    subject: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { lastWatchedAt: 'desc' },
      take: 5,
    });
  }

  async getTeacherVideoReport(videoId: string) {
    // Return all students progress for a specific video
    return this.prisma.videoProgress.findMany({
      where: { videoId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { completionPercentage: 'desc' },
    });
  }
}
