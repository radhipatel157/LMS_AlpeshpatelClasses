import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTeacherDto, UpdateTeacherDto } from './dto/teacher.dto';
import { DEFAULT_PAGE_SIZE } from '@myclass/shared';

@Injectable()
export class TeachersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, perPage = DEFAULT_PAGE_SIZE, search?: string) {
    const skip = (page - 1) * perPage;
    const where = search
      ? {
          user: {
            OR: [{ name: { contains: search } }, { email: { contains: search } }],
            deletedAt: null,
          },
        }
      : { user: { deletedAt: null } };

    const [teachers, total] = await Promise.all([
      this.prisma.teacher.findMany({
        where,
        skip,
        take: perPage,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true, isActive: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.teacher.count({ where }),
    ]);

    return { data: teachers, meta: { page, perPage, total, hasNext: skip + perPage < total } };
  }

  async findOne(id: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true, isActive: true } },
      },
    });
    if (!teacher) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Teacher profile not found' });
    return teacher;
  }

  async findByUserId(userId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    if (!teacher) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Teacher profile not found' });
    return teacher;
  }

  async create(dto: CreateTeacherDto) {
    const user = await this.prisma.user.findFirst({
      where: { id: dto.userId, deletedAt: null },
      include: { role: true, teacher: true },
    });
    if (!user) throw new NotFoundException({ code: 'NOT_FOUND', message: 'User not found' });
    if (user.role.name !== 'TEACHER') {
      throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'User must have TEACHER role' });
    }
    if (user.teacher) throw new BadRequestException({ code: 'CONFLICT', message: 'Teacher profile already exists' });

    return this.prisma.teacher.create({
      data: {
        userId: dto.userId,
        qualification: dto.qualification,
        bio: dto.bio,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async update(id: string, dto: UpdateTeacherDto) {
    await this.findOne(id);
    return this.prisma.teacher.update({
      where: { id },
      data: {
        qualification: dto.qualification,
        bio: dto.bio,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async remove(id: string) {
    const teacher = await this.findOne(id);
    await this.prisma.teacher.delete({ where: { id } });
    return { message: 'Teacher profile deleted', userId: teacher.userId };
  }
}
