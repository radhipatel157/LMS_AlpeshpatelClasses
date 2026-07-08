import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser, AuthenticatedUser } from '../../common/decorators/get-user.decorator';
import { UserRole } from '@myclass/shared';

@ApiTags('Analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('admin/overview')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin dashboard overview metrics' })
  getAdminOverview() {
    return this.service.getAdminOverview();
  }

  @Get('admin/watch-hours')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Watch hours grouped by subject (Admin)' })
  getAdminWatchHours() {
    return this.service.getAdminWatchHours();
  }

  @Get('admin/submission-rate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Submission status breakdown (Admin)' })
  getAdminSubmissionRate() {
    return this.service.getAdminSubmissionRate();
  }

  @Get('admin/dau')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Daily active users trend for last 30 days (Admin)' })
  getAdminDau() {
    return this.service.getAdminDauTrend();
  }

  @Get('teacher/my-students')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Teacher student progress and weak student list' })
  getTeacherStudents(@GetUser() user: AuthenticatedUser) {
    return this.service.getTeacherStudents(user.id);
  }

  @Get('teacher/engagement/:lessonId')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Per-student engagement for a lesson (Teacher/Admin)' })
  getTeacherEngagement(@GetUser() user: AuthenticatedUser, @Param('lessonId') lessonId: string) {
    return this.service.getTeacherLessonEngagement(user.id, lessonId);
  }

  @Get('student/progress')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Student overall learning progress' })
  getStudentProgress(@GetUser() user: AuthenticatedUser) {
    return this.service.getStudentProgress(user.id);
  }

  @Get('student/streak')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Student learning streak and daily watch time' })
  getStudentStreak(@GetUser() user: AuthenticatedUser) {
    return this.service.getStudentStreak(user.id);
  }
}
