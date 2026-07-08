import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateChapterDto, UpdateChapterDto, ReorderDto } from '../standards/dto/academic.dto';

@Injectable()
export class ChaptersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(subjectId?: string) {
    return this.prisma.chapter.findMany({
      where: { deletedAt: null, ...(subjectId ? { subjectId } : {}) },
      orderBy: { order: 'asc' },
      include: { subject: { include: { standard: true } }, _count: { select: { lessons: true } } },
    });
  }

  async findOne(id: string) {
    const chapter = await this.prisma.chapter.findFirst({
      where: { id, deletedAt: null },
      include: {
        subject: { include: { standard: true } },
        lessons: { where: { deletedAt: null }, orderBy: { order: 'asc' } },
      },
    });
    if (!chapter) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Chapter not found' });
    return chapter;
  }

  async create(dto: CreateChapterDto) {
    // Verify subject exists
    const subject = await this.prisma.subject.findFirst({ where: { id: dto.subjectId, deletedAt: null } });
    if (!subject) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Subject not found' });

    return this.prisma.chapter.create({
      data: { subjectId: dto.subjectId, name: dto.name, order: dto.order ?? 0 },
      include: { subject: true },
    });
  }

  async update(id: string, dto: UpdateChapterDto) {
    await this.findOne(id);
    return this.prisma.chapter.update({
      where: { id },
      data: { name: dto.name, ...(dto.order !== undefined && { order: dto.order }) },
      include: { subject: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.chapter.update({ where: { id }, data: { deletedAt: new Date(), status: 'archived' } });
    return { message: 'Chapter archived successfully' };
  }

  async reorder(dto: ReorderDto) {
    const transactions = dto.ids.map((id, index) =>
      this.prisma.chapter.update({
        where: { id },
        data: { order: index },
      }),
    );
    await this.prisma.$transaction(transactions);
    return { message: 'Chapters reordered successfully' };
  }
}
