import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateVideoDto, UpdateVideoDto } from './dto/video.dto';

@Injectable()
export class VideosService {
  constructor(private readonly prisma: PrismaService) {}

  private extractYoutubeId(input: string): string {
    const trimmed = input.trim();
    if (trimmed.length === 11 && !trimmed.includes('/') && !trimmed.includes('.')) {
      return trimmed;
    }
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = trimmed.match(regExp);
    if (match && match[2].length === 11) {
      return match[2];
    }
    throw new BadRequestException({
      code: 'VALIDATION_ERROR',
      message: 'Could not extract valid 11-character YouTube video ID from the input',
    });
  }

  async findAll(lessonId?: string) {
    return this.prisma.video.findMany({
      where: { deletedAt: null, ...(lessonId ? { lessonId } : {}) },
      orderBy: { order: 'asc' },
      include: { lesson: true },
    });
  }

  async findOne(id: string) {
    const video = await this.prisma.video.findFirst({
      where: { id, deletedAt: null },
      include: { lesson: { include: { chapter: true } } },
    });
    if (!video) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Video record not found' });
    return video;
  }

  async create(dto: CreateVideoDto) {
    // Validate lesson
    const lesson = await this.prisma.lesson.findFirst({ where: { id: dto.lessonId, deletedAt: null } });
    if (!lesson) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Lesson not found' });

    const youtubeId = this.extractYoutubeId(dto.youtubeIdOrUrl);

    // Auto-set thumbnail if not provided
    const thumbnailUrl = dto.thumbnailUrl || `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;

    return this.prisma.video.create({
      data: {
        lessonId: dto.lessonId,
        title: dto.title,
        youtubeId,
        thumbnailUrl,
        duration: dto.duration,
        order: dto.order ?? 0,
        status: 'draft',
      },
    });
  }

  async update(id: string, dto: UpdateVideoDto) {
    const video = await this.findOne(id);
    
    let youtubeId = video.youtubeId;
    if (dto.youtubeIdOrUrl) {
      youtubeId = this.extractYoutubeId(dto.youtubeIdOrUrl);
    }

    const data: Record<string, unknown> = {};
    if (dto.title) data.title = dto.title;
    if (dto.youtubeIdOrUrl) data.youtubeId = youtubeId;
    if (dto.thumbnailUrl !== undefined) data.thumbnailUrl = dto.thumbnailUrl;
    if (dto.duration !== undefined) data.duration = dto.duration;
    if (dto.order !== undefined) data.order = dto.order;

    return this.prisma.video.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.video.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'archived' },
    });
    return { message: 'Video soft-deleted successfully' };
  }
}
