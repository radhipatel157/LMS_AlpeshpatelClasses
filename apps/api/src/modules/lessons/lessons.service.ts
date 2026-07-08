import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateLessonDto, UpdateLessonDto, ReorderDto, CreateResourceDto } from '../standards/dto/academic.dto';

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(chapterId?: string) {
    return this.prisma.lesson.findMany({
      where: { deletedAt: null, ...(chapterId ? { chapterId } : {}) },
      orderBy: { order: 'asc' },
      include: {
        chapter: { include: { subject: { include: { standard: true } } } },
        _count: { select: { videos: true, assignments: true, resources: true } },
      },
    });
  }

  async findOne(id: string) {
    const lesson = await this.prisma.lesson.findFirst({
      where: { id, deletedAt: null },
      include: {
        chapter: { include: { subject: { include: { standard: true } } } },
        videos: { where: { deletedAt: null }, orderBy: { order: 'asc' } },
        assignments: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' } },
        resources: true,
      },
    });
    if (!lesson) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Lesson not found' });
    return lesson;
  }

  async create(dto: CreateLessonDto) {
    const chapter = await this.prisma.chapter.findFirst({ where: { id: dto.chapterId, deletedAt: null } });
    if (!chapter) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Chapter not found' });

    return this.prisma.lesson.create({
      data: {
        chapterId: dto.chapterId,
        title: dto.title,
        description: dto.description,
        order: dto.order ?? 0,
        status: 'draft',
      },
      include: { chapter: true },
    });
  }

  async update(id: string, dto: UpdateLessonDto) {
    await this.findOne(id);
    return this.prisma.lesson.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        ...(dto.order !== undefined && { order: dto.order }),
      },
      include: { chapter: true },
    });
  }

  async publish(id: string) {
    await this.findOne(id);
    return this.prisma.lesson.update({
      where: { id },
      data: { status: 'published' },
      include: { chapter: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.lesson.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'archived' },
    });
    return { message: 'Lesson archived successfully' };
  }

  async reorder(dto: ReorderDto) {
    const transactions = dto.ids.map((id, index) =>
      this.prisma.lesson.update({
        where: { id },
        data: { order: index },
      }),
    );
    await this.prisma.$transaction(transactions);
    return { message: 'Lessons reordered successfully' };
  }

  // ─── Resources Management ─────────────────────────────────────
  async addResource(lessonId: string, dto: CreateResourceDto) {
    await this.findOne(lessonId);
    return this.prisma.lessonResource.create({
      data: {
        lessonId,
        title: dto.title,
        fileUrl: dto.fileUrl,
        type: dto.type ?? 'pdf',
        fileSize: dto.fileSize,
      },
    });
  }

  async removeResource(lessonId: string, resourceId: string) {
    const resource = await this.prisma.lessonResource.findFirst({
      where: { id: resourceId, lessonId },
    });
    if (!resource) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Resource not found in this lesson' });

    await this.prisma.lessonResource.delete({
      where: { id: resourceId },
    });
    return { message: 'Resource deleted successfully' };
  }
}
