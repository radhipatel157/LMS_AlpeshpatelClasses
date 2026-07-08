import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateSubmissionDto, ResubmitDto, EvaluateSubmissionDto } from './dto/submission.dto';
import { MAX_FILES_PER_SUBMISSION, NotificationType } from '@myclass/shared';

@Injectable()
export class SubmissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByAssignment(assignmentId: string) {
    const assignment = await this.prisma.assignment.findFirst({
      where: { id: assignmentId, deletedAt: null },
    });
    if (!assignment) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Assignment not found' });

    return this.prisma.assignmentSubmission.findMany({
      where: { assignmentId },
      include: {
        student: { select: { id: true, name: true, email: true, avatarUrl: true } },
        evaluator: { select: { id: true, name: true } },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async findMySubmissions(studentId: string) {
    return this.prisma.assignmentSubmission.findMany({
      where: { studentId },
      include: {
        assignment: {
          include: {
            lesson: {
              include: { chapter: { include: { subject: { include: { standard: true } } } } },
            },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async submit(studentId: string, dto: CreateSubmissionDto) {
    const assignment = await this.prisma.assignment.findFirst({
      where: { id: dto.assignmentId, deletedAt: null },
      include: { teacher: true },
    });
    if (!assignment) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Assignment not found' });

    if (assignment.status === 'closed') {
      throw new BadRequestException({ code: 'DEADLINE_PASSED', message: 'Assignment is closed' });
    }
    if (assignment.status !== 'published') {
      throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'Assignment is not open for submissions' });
    }

    if (dto.files.length === 0 || dto.files.length > MAX_FILES_PER_SUBMISSION) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: `Between 1 and ${MAX_FILES_PER_SUBMISSION} files required`,
      });
    }

    const existing = await this.prisma.assignmentSubmission.findFirst({
      where: { assignmentId: dto.assignmentId, studentId },
    });
    if (existing) {
      throw new BadRequestException({ code: 'CONFLICT', message: 'Submission already exists. Use resubmit endpoint.' });
    }

    const now = new Date();
    const isLate = now > assignment.deadline;

    const submission = await this.prisma.assignmentSubmission.create({
      data: {
        assignmentId: dto.assignmentId,
        studentId,
        submittedFiles: dto.files as unknown as Prisma.InputJsonValue,
        isLate,
        status: 'submitted',
      },
      include: {
        assignment: true,
        student: { select: { id: true, name: true, email: true } },
      },
    });

    await this.prisma.notification.create({
      data: {
        userId: assignment.teacherId,
        type: NotificationType.SUBMISSION_RECEIVED,
        title: 'New Submission Received',
        body: `${submission.student.name} submitted "${assignment.title}"`,
        link: `/teacher/assignments/${assignment.id}/submissions`,
      },
    });

    return submission;
  }

  async resubmit(studentId: string, submissionId: string, dto: ResubmitDto) {
    const submission = await this.prisma.assignmentSubmission.findFirst({
      where: { id: submissionId, studentId },
      include: { assignment: { include: { teacher: true } } },
    });
    if (!submission) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Submission not found' });

    const { assignment } = submission;
    if (!assignment.allowResubmission) {
      throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'Resubmission not allowed for this assignment' });
    }
    if (assignment.status === 'closed') {
      throw new BadRequestException({ code: 'DEADLINE_PASSED', message: 'Assignment is closed' });
    }
    if (new Date() > assignment.deadline) {
      throw new BadRequestException({ code: 'DEADLINE_PASSED', message: 'Deadline has passed' });
    }

    if (dto.files.length === 0 || dto.files.length > MAX_FILES_PER_SUBMISSION) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: `Between 1 and ${MAX_FILES_PER_SUBMISSION} files required`,
      });
    }

    const now = new Date();
    const isLate = now > assignment.deadline;

    const updated = await this.prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        submittedFiles: dto.files as unknown as Prisma.InputJsonValue,
        submittedAt: now,
        isLate,
        resubmissionCount: { increment: 1 },
        status: 'submitted',
        marksObtained: null,
        remarks: null,
        evaluatedAt: null,
        evaluatedBy: null,
      },
      include: {
        assignment: true,
        student: { select: { id: true, name: true, email: true } },
      },
    });

    await this.prisma.notification.create({
      data: {
        userId: assignment.teacherId,
        type: NotificationType.SUBMISSION_RECEIVED,
        title: 'Assignment Resubmitted',
        body: `${updated.student.name} resubmitted "${assignment.title}"`,
        link: `/teacher/assignments/${assignment.id}/submissions`,
      },
    });

    return updated;
  }

  async evaluate(evaluatorId: string, submissionId: string, dto: EvaluateSubmissionDto) {
    const submission = await this.prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: { assignment: true, student: { select: { id: true, name: true } } },
    });
    if (!submission) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Submission not found' });

    const normalizedStatus = dto.status.toLowerCase();
    if (!['approved', 'rejected'].includes(normalizedStatus)) {
      throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'Status must be approved or rejected' });
    }

    if (dto.marks > submission.assignment.totalMarks) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: `Marks cannot exceed ${submission.assignment.totalMarks}`,
      });
    }

    const updated = await this.prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        marksObtained: dto.marks,
        remarks: dto.remarks,
        status: normalizedStatus === 'approved' ? 'approved' : 'rejected',
        evaluatedAt: new Date(),
        evaluatedBy: evaluatorId,
      },
      include: {
        assignment: true,
        student: { select: { id: true, name: true, email: true } },
        evaluator: { select: { id: true, name: true } },
      },
    });

    const notifType =
      normalizedStatus === 'approved' ? NotificationType.MARKS_PUBLISHED : NotificationType.ASSIGNMENT_REJECTED;
    const notifTitle =
      normalizedStatus === 'approved' ? 'Marks Published' : 'Assignment Rejected';

    await this.prisma.notification.create({
      data: {
        userId: submission.studentId,
        type: notifType,
        title: notifTitle,
        body: `Your submission for "${submission.assignment.title}" has been ${normalizedStatus}. Marks: ${dto.marks}/${submission.assignment.totalMarks}`,
        link: `/student/assignments/${submission.assignmentId}`,
      },
    });

    return updated;
  }
}
