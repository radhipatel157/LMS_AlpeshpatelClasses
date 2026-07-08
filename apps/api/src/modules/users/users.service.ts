import {
  Injectable, NotFoundException, ConflictException, BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, UpdateProfileDto } from './dto/user.dto';
import { BCRYPT_SALT_ROUNDS, DEFAULT_PAGE_SIZE } from '@myclass/shared';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, perPage = DEFAULT_PAGE_SIZE, search?: string, role?: string) {
    const skip = (page - 1) * perPage;
    const where = {
      deletedAt: null,
      ...(role ? { role: { name: role } } : {}),
      ...(search ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] } : {}),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where, skip, take: perPage,
        include: { role: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    const safeUsers = users.map(({ passwordHash, ...u }) => u);
    return { data: safeUsers, meta: { page, perPage, total, hasNext: skip + perPage < total } };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: { role: true, student: { include: { standard: true } }, teacher: true },
    });
    if (!user) throw new NotFoundException({ code: 'NOT_FOUND', message: 'User not found' });
    const { passwordHash, ...safe } = user;
    return safe;
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException({ code: 'CONFLICT', message: 'Email already registered' });

    const role = await this.prisma.role.findUnique({ where: { name: dto.role } });
    if (!role) throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'Invalid role' });

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);
    const user = await this.prisma.user.create({
      data: { email: dto.email, passwordHash, name: dto.name, phone: dto.phone, roleId: role.id },
      include: { role: true },
    });

    // Auto-create student/teacher profile
    if (dto.role === 'STUDENT') await this.prisma.student.create({ data: { userId: user.id } });
    if (dto.role === 'TEACHER') await this.prisma.teacher.create({ data: { userId: user.id } });

    const { passwordHash: _, ...safe } = user;
    return safe;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    const data: Record<string, unknown> = {};
    if (dto.name) data.name = dto.name;
    if (dto.phone) data.phone = dto.phone;
    if (dto.password) data.passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const user = await this.prisma.user.update({ where: { id }, data, include: { role: true } });
    const { passwordHash, ...safe } = user;
    return safe;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.user.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
    return { message: 'User deactivated' };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { ...(dto.name && { name: dto.name }), ...(dto.phone && { phone: dto.phone }) },
      include: { role: true },
    });
    const { passwordHash, ...safe } = user;
    return safe;
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { avatarUrl } });
    return { avatarUrl };
  }
}
