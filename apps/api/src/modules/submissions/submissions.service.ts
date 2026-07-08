import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateSubmissionDto, ResubmitDto, EvaluateSubmissionDto, SubmissionFileDto } from './dto/submission.dto';
import {
  ALLOWED_SUBMISSION_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  MAX_FILES_PER_SUBMISSION,
  NotificationType,
  UserRole,
} from '@myclass/shared';

@Injectable()
export class SubmissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByAssignment(userId: string, role: string, assignmentId: string) {
    const assignment = await this.prisma.assignment.findFirst({
      where: { id: assignmentId, deletedAt: null },
    });
    if (!assignment) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Assignment not found' });
    this.assertCanManageAssignment(userId, role, assignment.teacherId);

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

    if (new Date() > assignment.deadline) {
      throw new BadRequestException({ code: 'DEADLINE_PASSED', message: 'Deadline has passed' });
    }
    this.validateSubmissionFiles(dto.files);

    const existing = await this.prisma.assignmentSubmission.findFirst({
      where: { assignmentId: dto.assignmentId, studentId },
    });
    if (existing) {
      throw new BadRequestException({ code: 'CONFLICT', message: 'Submission already exists. Use resubmit endpoint.' });
    }

    const submission = await this.prisma.assignmentSubmission.create({
      data: {
        assignmentId: dto.assignmentId,
        studentId,
        submittedFiles: dto.files as unknown as Prisma.InputJsonValue,
        isLate: false,
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

    this.validateSubmissionFiles(dto.files);

    const now = new Date();

    const updated = await this.prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        submittedFiles: dto.files as unknown as Prisma.InputJsonValue,
        submittedAt: now,
        isLate: false,
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

  async evaluate(evaluatorId: string, evaluatorRole: string, submissionId: string, dto: EvaluateSubmissionDto) {
    const submission = await this.prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: { assignment: true, student: { select: { id: true, name: true } } },
    });
    if (!submission) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Submission not found' });
    this.assertCanManageAssignment(evaluatorId, evaluatorRole, submission.assignment.teacherId);

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

  private validateSubmissionFiles(files: SubmissionFileDto[]) {
    if (!files || files.length === 0 || files.length > MAX_FILES_PER_SUBMISSION) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: `Between 1 and ${MAX_FILES_PER_SUBMISSION} files required`,
      });
    }

    for (const file of files) {
      if (file.mimeType && !ALLOWED_SUBMISSION_MIME_TYPES.includes(file.mimeType)) {
        throw new BadRequestException({
          code: 'INVALID_FILE_TYPE',
          message: `File type ${file.mimeType} is not allowed`,
        });
      }
      if (file.fileSize && file.fileSize > MAX_FILE_SIZE_BYTES) {
        throw new BadRequestException({ code: 'FILE_TOO_LARGE', message: 'File exceeds 10 MB limit' });
      }
    }
  }

  private assertCanManageAssignment(userId: string, role: string, teacherId: string) {
    if (role === UserRole.ADMIN) return;
    if (role === UserRole.TEACHER && teacherId === userId) return;
    throw new ForbiddenException({ code: 'FORBIDDEN', message: 'You can only access submissions for your own assignments' });
  }
}
