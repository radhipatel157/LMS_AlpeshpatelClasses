import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateStudentDto, UpdateStudentDto } from './dto/student.dto';
import { DEFAULT_PAGE_SIZE } from '@myclass/shared';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, perPage = DEFAULT_PAGE_SIZE, standardId?: string, search?: string) {
    const skip = (page - 1) * perPage;
    const where = {
      ...(standardId ? { standardId } : {}),
      ...(search
        ? {
            user: {
              OR: [{ name: { contains: search } }, { email: { contains: search } }],
              deletedAt: null,
            },
          }
        : { user: { deletedAt: null } }),
    };

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip,
        take: perPage,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true, isActive: true } },
          standard: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.student.count({ where }),
    ]);

    return { data: students, meta: { page, perPage, total, hasNext: skip + perPage < total } };
  }

  async findOne(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true, isActive: true } },
        standard: true,
      },
    });
    if (!student) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Student profile not found' });
    return student;
  }

  async findByUserId(userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      include: { user: { select: { id: true, name: true, email: true } }, standard: true },
    });
    if (!student) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Student profile not found' });
    return student;
  }

  async create(dto: CreateStudentDto) {
    const user = await this.prisma.user.findFirst({
      where: { id: dto.userId, deletedAt: null },
      include: { role: true, student: true },
    });
    if (!user) throw new NotFoundException({ code: 'NOT_FOUND', message: 'User not found' });
    if (user.role.name !== 'STUDENT') {
      throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'User must have STUDENT role' });
    }
    if (user.student) throw new BadRequestException({ code: 'CONFLICT', message: 'Student profile already exists' });

    if (dto.standardId) {
      const standard = await this.prisma.standard.findFirst({ where: { id: dto.standardId, deletedAt: null } });
      if (!standard) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Standard not found' });
    }

    return this.prisma.student.create({
      data: {
        userId: dto.userId,
        standardId: dto.standardId,
        parentPhone: dto.parentPhone,
        address: dto.address,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      },
      include: { user: { select: { id: true, name: true, email: true } }, standard: true },
    });
  }

  async update(id: string, dto: UpdateStudentDto) {
    await this.findOne(id);

    if (dto.standardId) {
      const standard = await this.prisma.standard.findFirst({ where: { id: dto.standardId, deletedAt: null } });
      if (!standard) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Standard not found' });
    }

    return this.prisma.student.update({
      where: { id },
      data: {
        standardId: dto.standardId,
        parentPhone: dto.parentPhone,
        address: dto.address,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      },
      include: { user: { select: { id: true, name: true, email: true } }, standard: true },
    });
  }

  async remove(id: string) {
    const student = await this.findOne(id);
    await this.prisma.student.delete({ where: { id } });
    return { message: 'Student profile deleted', userId: student.userId };
  }
}
