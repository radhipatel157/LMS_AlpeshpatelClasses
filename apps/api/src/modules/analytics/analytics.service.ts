import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Admin Analytics ───────────────────────────────────────────
  async getAdminOverview() {
    const [studentRole, teacherRole] = await Promise.all([
      this.prisma.role.findUnique({ where: { name: 'STUDENT' } }),
      this.prisma.role.findUnique({ where: { name: 'TEACHER' } }),
    ]);

    const [
      totalStudents,
      totalTeachers,
      watchSecondsAgg,
      publishedAssignments,
      submittedCount,
      dauToday,
    ] = await Promise.all([
      this.prisma.user.count({ where: { roleId: studentRole!.id, deletedAt: null, isActive: true } }),
      this.prisma.user.count({ where: { roleId: teacherRole!.id, deletedAt: null, isActive: true } }),
      this.prisma.videoProgress.aggregate({ _sum: { watchedSeconds: true } }),
      this.prisma.assignment.count({ where: { status: 'published', deletedAt: null } }),
      this.prisma.assignmentSubmission.count(),
      this.getDauForDate(new Date()),
    ]);

    const totalWatchHours = Math.round(((watchSecondsAgg._sum.watchedSeconds ?? 0) / 3600) * 100) / 100;
    const submissionRate =
      publishedAssignments > 0 ? Math.round((submittedCount / publishedAssignments) * 100) : 0;

    return {
      totalStudents,
      totalTeachers,
      totalWatchHours,
      submissionRate,
      dauToday,
    };
  }

  async getAdminWatchHours() {
    const progress = await this.prisma.videoProgress.findMany({
      include: {
        video: {
          include: {
            lesson: {
              include: { chapter: { include: { subject: true } } },
            },
          },
        },
      },
    });

    const bySubject: Record<string, number> = {};
    for (const p of progress) {
      const subjectName = p.video.lesson.chapter.subject.name;
      bySubject[subjectName] = (bySubject[subjectName] ?? 0) + p.watchedSeconds;
    }

    return Object.entries(bySubject).map(([subject, seconds]) => ({
      subject,
      watchHours: Math.round((seconds / 3600) * 100) / 100,
    }));
  }

  async getAdminSubmissionRate() {
    const statuses = ['submitted', 'evaluated', 'approved', 'rejected', 'pending'];
    const counts = await Promise.all(
      statuses.map((status) =>
        this.prisma.assignmentSubmission.count({ where: { status } }),
      ),
    );

    return statuses.map((status, i) => ({ status, count: counts[i] }));
  }

  async getAdminDauTrend(days = 30) {
    const result: { date: string; count: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const count = await this.getDauForDate(date);
      result.push({ date: date.toISOString().split('T')[0], count });
    }
    return result;
  }

  private async getDauForDate(date: Date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const logs = await this.prisma.activityLog.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: { userId: true },
      distinct: ['userId'],
    });
    return logs.length;
  }

  // ─── Teacher Analytics ─────────────────────────────────────────
  async getTeacherStudents(teacherId: string) {
    const assignments = await this.prisma.assignment.findMany({
      where: { teacherId, deletedAt: null },
      select: { lesson: { select: { chapter: { select: { subject: { select: { standardId: true } } } } } } },
    });

    const standardIds = [...new Set(
      assignments.map((a) => a.lesson.chapter.subject.standardId),
    )];

    if (standardIds.length === 0) return { students: [], weakStudents: [] };

    const students = await this.prisma.student.findMany({
      where: { standardId: { in: standardIds } },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        standard: true,
      },
    });

    const studentProgress = await Promise.all(
      students.map(async (student) => {
        const progress = await this.prisma.videoProgress.findMany({
          where: { studentId: student.userId },
        });
        const avgCompletion =
          progress.length > 0
            ? progress.reduce((sum, p) => sum + Number(p.completionPercentage), 0) / progress.length
            : 0;
        return {
          studentId: student.userId,
          name: student.user.name,
          email: student.user.email,
          standard: student.standard?.name,
          avgCompletion: Math.round(avgCompletion * 100) / 100,
        };
      }),
    );

    const weakStudents = studentProgress.filter((s) => s.avgCompletion < 50);

    return { students: studentProgress, weakStudents };
  }

  async getTeacherLessonEngagement(teacherId: string, lessonId: string) {
    const lesson = await this.prisma.lesson.findFirst({
      where: { id: lessonId, deletedAt: null },
      include: { videos: { where: { deletedAt: null } } },
    });
    if (!lesson) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Lesson not found' });

    const videoIds = lesson.videos.map((v) => v.id);
    const progress = await this.prisma.videoProgress.findMany({
      where: { videoId: { in: videoIds } },
      include: {
        student: { select: { id: true, name: true, email: true } },
        video: { select: { id: true, title: true } },
      },
    });

    const byStudent: Record<string, { name: string; email: string; avgCompletion: number; videos: number }> = {};
    for (const p of progress) {
      if (!byStudent[p.studentId]) {
        byStudent[p.studentId] = {
          name: p.student.name,
          email: p.student.email,
          avgCompletion: 0,
          videos: 0,
        };
      }
      byStudent[p.studentId].avgCompletion += Number(p.completionPercentage);
      byStudent[p.studentId].videos += 1;
    }

    const engagement = Object.entries(byStudent).map(([studentId, data]) => ({
      studentId,
      name: data.name,
      email: data.email,
      avgCompletion: data.videos > 0 ? Math.round((data.avgCompletion / data.videos) * 100) / 100 : 0,
    }));

    const videoStats = await Promise.all(
      lesson.videos.map(async (video) => {
        const stats = await this.prisma.videoProgress.aggregate({
          where: { videoId: video.id },
          _avg: { completionPercentage: true },
          _count: true,
        });
        return {
          videoId: video.id,
          title: video.title,
          avgCompletion: Math.round(Number(stats._avg.completionPercentage ?? 0) * 100) / 100,
          studentCount: stats._count,
        };
      }),
    );

    return { lesson: { id: lesson.id, title: lesson.title }, engagement, videoStats };
  }

  // ─── Student Analytics ───────────────────────────────────────────
  async getStudentProgress(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId: studentId },
      include: { standard: true },
    });
    if (!student?.standardId) {
      return { progressPercentage: 0, completedLessons: 0, totalLessons: 0, assignmentScoreAvg: 0 };
    }

    const lessons = await this.prisma.lesson.findMany({
      where: {
        deletedAt: null,
        status: 'published',
        chapter: { subject: { standardId: student.standardId, deletedAt: null } },
      },
      include: { videos: { where: { deletedAt: null, status: 'published' } } },
    });

    let completedLessons = 0;
    for (const lesson of lessons) {
      if (lesson.videos.length === 0) continue;
      const videoIds = lesson.videos.map((v) => v.id);
      const completed = await this.prisma.videoProgress.count({
        where: { studentId, videoId: { in: videoIds }, isCompleted: true },
      });
      if (completed === lesson.videos.length) completedLessons++;
    }

    const totalLessons = lessons.length;
    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    const gradedSubmissions = await this.prisma.assignmentSubmission.findMany({
      where: { studentId, marksObtained: { not: null } },
      include: { assignment: { select: { totalMarks: true } } },
    });

    const assignmentScoreAvg =
      gradedSubmissions.length > 0
        ? Math.round(
            (gradedSubmissions.reduce((sum, s) => {
              const pct = ((s.marksObtained ?? 0) / s.assignment.totalMarks) * 100;
              return sum + pct;
            }, 0) /
              gradedSubmissions.length) *
              100,
          ) / 100
        : 0;

    return { progressPercentage, completedLessons, totalLessons, assignmentScoreAvg };
  }

  async getStudentStreak(studentId: string) {
    const progress = await this.prisma.videoProgress.findMany({
      where: { studentId, lastWatchedAt: { not: null } },
      select: { lastWatchedAt: true },
      orderBy: { lastWatchedAt: 'desc' },
    });

    if (progress.length === 0) return { streak: 0, dailyWatchTime: [] };

    const watchDays = new Set(
      progress
        .filter((p) => p.lastWatchedAt)
        .map((p) => p.lastWatchedAt!.toISOString().split('T')[0]),
    );

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      if (watchDays.has(dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    const dailyWatchTime: { date: string; seconds: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const sessions = await this.prisma.watchSession.findMany({
        where: {
          studentId,
          startedAt: { gte: date, lt: nextDate },
        },
      });
      const seconds = sessions.reduce((sum, s) => sum + s.watchedSeconds, 0);
      dailyWatchTime.push({ date: date.toISOString().split('T')[0], seconds });
    }

    return { streak, dailyWatchTime };
  }
}
