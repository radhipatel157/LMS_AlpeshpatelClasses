import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateAssignmentDto, UpdateAssignmentDto } from './dto/assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(lessonId?: string) {
    return this.prisma.assignment.findMany({
      where: { deletedAt: null, ...(lessonId ? { lessonId } : {}) },
      orderBy: { createdAt: 'desc' },
      include: {
        lesson: { include: { chapter: { include: { subject: { include: { standard: true } } } } } },
        _count: { select: { submissions: true } },
      },
    });
  }

  async findOne(id: string) {
    const assignment = await this.prisma.assignment.findFirst({
      where: { id, deletedAt: null },
      include: {
        lesson: { include: { chapter: { include: { subject: { include: { standard: true } } } } } },
        submissions: { include: { student: { select: { id: true, name: true, email: true, avatarUrl: true } } } },
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
        attachments: [], // JSON format
        status: 'draft',
      },
    });
  }

  async update(id: string, dto: UpdateAssignmentDto) {
    await this.findOne(id);
    return this.prisma.assignment.update({
      where: { id },
      data: {
        title: dto.title,
        instructions: dto.description,
        deadline: dto.dueDate ? new Date(dto.dueDate) : undefined,
        totalMarks: dto.maxMarks,
        allowResubmission: dto.allowResubmission,
      },
    });
  }

  async publish(id: string) {
    const assignment = await this.findOne(id);
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

  async close(id: string) {
    await this.findOne(id);
    return this.prisma.assignment.update({
      where: { id },
      data: { status: 'closed' },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.assignment.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'archived' },
    });
    return { message: 'Assignment soft-deleted successfully' };
  }
}
