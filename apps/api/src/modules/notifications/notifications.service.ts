import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../common/prisma/prisma.service';
import { BroadcastNotificationDto } from './dto/notification.dto';
import { DEFAULT_PAGE_SIZE, DEADLINE_REMINDER_HOURS_BEFORE, NotificationType } from '@myclass/shared';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, page = 1, perPage = DEFAULT_PAGE_SIZE) {
    const skip = (page - 1) * perPage;
    const where = { userId };

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return { data: notifications, meta: { page, perPage, total, hasNext: skip + perPage < total } };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });
    if (!notification) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Notification not found' });

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return { updated: result.count };
  }

  async remove(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });
    if (!notification) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Notification not found' });

    await this.prisma.notification.delete({ where: { id: notificationId } });
    return { message: 'Notification deleted' };
  }

  async broadcast(dto: BroadcastNotificationDto) {
    const where = dto.targetRole
      ? { deletedAt: null, isActive: true, role: { name: dto.targetRole } }
      : { deletedAt: null, isActive: true };

    const users = await this.prisma.user.findMany({ where, select: { id: true } });

    const notifications = users.map((user) =>
      this.prisma.notification.create({
        data: {
          userId: user.id,
          type: NotificationType.SYSTEM_ALERT,
          title: dto.title,
          body: dto.body,
          link: dto.link,
        },
      }),
    );

    await Promise.all(notifications);
    return { message: `Broadcast sent to ${users.length} users` };
  }

  async createForUser(userId: string, type: string, title: string, body: string, link?: string) {
    return this.prisma.notification.create({
      data: { userId, type, title, body, link },
    });
  }

  @Cron(CronExpression.EVERY_HOUR)
  async sendDeadlineReminders() {
    const now = new Date();
    const windowStart = new Date(now.getTime() + (DEADLINE_REMINDER_HOURS_BEFORE - 1) * 60 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + (DEADLINE_REMINDER_HOURS_BEFORE + 1) * 60 * 60 * 1000);

    const assignments = await this.prisma.assignment.findMany({
      where: {
        status: 'published',
        deletedAt: null,
        deadline: { gte: windowStart, lte: windowEnd },
      },
      include: {
        lesson: { include: { chapter: { include: { subject: true } } } },
      },
    });

    for (const assignment of assignments) {
      const standardId = assignment.lesson.chapter.subject.standardId;
      const students = await this.prisma.student.findMany({ where: { standardId } });

      for (const student of students) {
        const alreadySent = await this.prisma.notification.findFirst({
          where: {
            userId: student.userId,
            type: NotificationType.ASSIGNMENT_DEADLINE,
            body: { contains: assignment.id },
          },
        });
        if (alreadySent) continue;

        await this.prisma.notification.create({
          data: {
            userId: student.userId,
            type: NotificationType.ASSIGNMENT_DEADLINE,
            title: 'Assignment Deadline Approaching',
            body: `"${assignment.title}" is due in ~24 hours. [${assignment.id}]`,
            link: `/student/assignments/${assignment.id}`,
          },
        });
      }
    }
  }
}
