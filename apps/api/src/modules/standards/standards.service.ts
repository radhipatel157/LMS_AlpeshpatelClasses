import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateStandardDto, UpdateStandardDto } from './dto/academic.dto';

@Injectable()
export class StandardsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.standard.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: { order: 'asc' },
      include: { _count: { select: { subjects: true, students: true } } },
    });
  }

  async findOne(id: string) {
    const std = await this.prisma.standard.findFirst({
      where: { id, deletedAt: null },
      include: { subjects: { where: { deletedAt: null }, orderBy: { order: 'asc' } } },
    });
    if (!std) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Standard not found' });
    return std;
  }

  async create(dto: CreateStandardDto) {
    return this.prisma.standard.create({ data: { name: dto.name, order: dto.order ?? 0 } });
  }

  async update(id: string, dto: UpdateStandardDto) {
    await this.findOne(id);
    return this.prisma.standard.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.standard.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
    return { message: 'Standard archived' };
  }
}
