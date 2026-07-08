import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StudentsModule } from './modules/students/students.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { StandardsModule } from './modules/standards/standards.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { ChaptersModule } from './modules/chapters/chapters.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { VideosModule } from './modules/videos/videos.module';
import { VideoProgressModule } from './modules/video-progress/video-progress.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { SubmissionsModule } from './modules/submissions/submissions.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { UploadsModule } from './modules/uploads/uploads.module';

@Module({
  imports: [
    // ─── Config ──────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ─── Rate Limiting ───────────────────────────────────────────
    ThrottlerModule.forRoot([
      {
        name: 'global',
        ttl: 60000, // 1 minute
        limit: 100,
      },
    ]),

    // ─── CRON Scheduler ──────────────────────────────────────────
    ScheduleModule.forRoot(),

    // ─── Database ────────────────────────────────────────────────
    PrismaModule,

    // ─── Feature Modules ─────────────────────────────────────────
    AuthModule,
    UsersModule,
    StudentsModule,
    TeachersModule,
    StandardsModule,
    SubjectsModule,
    ChaptersModule,
    LessonsModule,
    VideosModule,
    VideoProgressModule,
    AssignmentsModule,
    SubmissionsModule,
    NotificationsModule,
    AnalyticsModule,
    UploadsModule,
  ],
})
export class AppModule {}
