import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { VideoProgressService } from './video-progress.service';
import { VideoHeartbeatDto } from '../videos/dto/video.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser, AuthenticatedUser } from '../../common/decorators/get-user.decorator';
import { UserRole } from '@myclass/shared';

@ApiTags('Video Progress')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('video-progress')
export class VideoProgressController {
  constructor(private readonly service: VideoProgressService) {}

  @Post('heartbeat')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Save/sync play progress heartbeat (Student only)' })
  handleHeartbeat(@GetUser() user: AuthenticatedUser, @Body() dto: VideoHeartbeatDto) {
    return this.service.handleHeartbeat(user.id, dto);
  }

  @Get('history')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Get current student\'s full watch history (Student only)' })
  getWatchHistory(@GetUser() user: AuthenticatedUser) {
    return this.service.getWatchHistory(user.id);
  }

  @Get('continue-watching')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Get current student\'s in-progress videos (Student only)' })
  getContinueWatching(@GetUser() user: AuthenticatedUser) {
    return this.service.getContinueWatching(user.id);
  }

  @Get('teacher/:videoId')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get progress report of all students for a video (Teacher/Admin only)' })
  getTeacherReport(@Param('videoId') videoId: string) {
    return this.service.getTeacherVideoReport(videoId);
  }

  @Get(':videoId')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Get student\'s own progress for a video (Student only)' })
  getProgressForVideo(@GetUser() user: AuthenticatedUser, @Param('videoId') videoId: string) {
    return this.service.getProgressForVideo(user.id, videoId);
  }
}
