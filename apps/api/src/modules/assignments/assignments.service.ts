import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateAssignmentDto, UpdateAssignmentDto } from './dto/assignment.dto';
import { UserRole } from '@myclass/shared';

@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, role: string, lessonId?: string) {
    const roleWhere = this.getAssignmentVisibilityWhere(userId, role);
    return this.prisma.assignment.findMany({
      where: { deletedAt: null, ...roleWhere, ...(lessonId ? { lessonId } : {}) },
      orderBy: { createdAt: 'desc' },
      include: {
        lesson: { include: { chapter: { include: { subject: { include: { standard: true } } } } } },
        _count: { select: { submissions: true } },
      },
    });
  }

  async findOne(id: string, userId?: string, role?: string) {
    const roleWhere = userId && role ? this.getAssignmentVisibilityWhere(userId, role) : {};
    const assignment = await this.prisma.assignment.findFirst({
      where: { id, deletedAt: null, ...roleWhere },
      include: {
        lesson: { include: { chapter: { include: { subject: { include: { standard: true } } } } } },
        submissions: {
          where: role === UserRole.STUDENT ? { studentId: userId } : undefined,
          include: { student: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        },
      },
    });
    if (!assignment) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Assignment not found' });
    return assignment;
  }

  async create(teacherId: string, dto: CreateAssignmentDto) {
    // Validate lesson
    const lesson = await this.prisma.lesson.findFirst({ where: { id: dto.lessonId, deletedAt: null } });
    if (!lesson) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Lesson not found' });

    return this.prisma.assignment.create({
      data: {
        lessonId: dto.lessonId,
        teacherId,
        title: dto.title,
        instructions: dto.description || '',
        deadline: new Date(dto.dueDate),
        totalMarks: dto.maxMarks,
        allowResubmission: dto.allowResubmission ?? false,
        attachments: (dto.attachments ?? []) as unknown as Prisma.InputJsonValue,
        status: 'draft',
      },
    });
  }

  async update(id: string, userId: string, role: string, dto: UpdateAssignmentDto) {
    await this.ensureCanManageAssignment(id, userId, role);
    return this.prisma.assignment.update({
      where: { id },
      data: {
        title: dto.title,
        instructions: dto.description,
        deadline: dto.dueDate ? new Date(dto.dueDate) : undefined,
        totalMarks: dto.maxMarks,
        allowResubmission: dto.allowResubmission,
        attachments: dto.attachments ? (dto.attachments as unknown as Prisma.InputJsonValue) : undefined,
      },
    });
  }

  async publish(id: string, userId: string, role: string) {
    const assignment = await this.ensureCanManageAssignment(id, userId, role);
    const updated = await this.prisma.assignment.update({
      where: { id },
      data: { status: 'published' },
    });

    // Notify all students in this lesson's standard
    try {
      const lessonWithStandard = await this.prisma.lesson.findFirst({
        where: { id: assignment.lessonId },
        include: { chapter: { include: { subject: true } } },
      });

      if (lessonWithStandard) {
        const standardId = lessonWithStandard.chapter.subject.standardId;
        const students = await this.prisma.student.findMany({ where: { standardId } });

        const notifications = students.map((std) =>
          this.prisma.notification.create({
            data: {
              userId: std.userId,
              title: 'New Assignment Published',
              body: `New assignment "${assignment.title}" has been published for ${lessonWithStandard.title}. Due date: ${assignment.deadline.toLocaleDateString()}`,
              type: 'ASSIGNMENT_CREATED',
            },
          }),
        );
        await Promise.all(notifications);
      }
    } catch (e) {
      console.error('Failed to dispatch publish notifications', e);
    }

    return updated;
  }

  async close(id: string, userId: string, role: string) {
    await this.ensureCanManageAssignment(id, userId, role);
    return this.prisma.assignment.update({
      where: { id },
      data: { status: 'closed' },
    });
  }

  async remove(id: string, userId: string, role: string) {
    await this.ensureCanManageAssignment(id, userId, role);
    await this.prisma.assignment.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'archived' },
    });
    return { message: 'Assignment soft-deleted successfully' };
  }

  private getAssignmentVisibilityWhere(userId: string, role: string): Prisma.AssignmentWhereInput {
    if (role === UserRole.ADMIN) return {};
    if (role === UserRole.TEACHER) return { teacherId: userId };
    if (role === UserRole.STUDENT) {
      return {
        status: 'published',
        lesson: {
          chapter: {
            subject: {
              standard: {
                students: { some: { userId } },
              },
            },
          },
        },
      };
    }
    return { id: '__never__' };
  }

  private async ensureCanManageAssignment(id: string, userId: string, role: string) {
    const assignment = await this.prisma.assignment.findFirst({
      where: { id, deletedAt: null },
    });
    if (!assignment) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Assignment not found' });
    if (role !== UserRole.ADMIN && assignment.teacherId !== userId) {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: 'You can only manage your own assignments' });
    }
    return assignment;
  }
}
