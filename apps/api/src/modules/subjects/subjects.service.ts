import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateSubjectDto, UpdateSubjectDto } from '../standards/dto/academic.dto';

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(standardId?: string) {
    return this.prisma.subject.findMany({
      where: { deletedAt: null, ...(standardId ? { standardId } : {}) },
      orderBy: { order: 'asc' },
      include: { standard: true, _count: { select: { chapters: true } } },
    });
  }

  async findOne(id: string) {
    const sub = await this.prisma.subject.findFirst({
      where: { id, deletedAt: null },
      include: { standard: true, chapters: { where: { deletedAt: null }, orderBy: { order: 'asc' } } },
    });
    if (!sub) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Subject not found' });
    return sub;
  }

  async create(dto: CreateSubjectDto) {
    return this.prisma.subject.create({
      data: { standardId: dto.standardId, name: dto.name, description: dto.description, order: dto.order ?? 0 },
      include: { standard: true },
    });
  }

  async update(id: string, dto: UpdateSubjectDto) {
    await this.findOne(id);
    return this.prisma.subject.update({ where: { id }, data: dto, include: { standard: true } });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.subject.update({ where: { id }, data: { deletedAt: new Date(), status: 'archived' } });
    return { message: 'Subject archived' };
  }
}
