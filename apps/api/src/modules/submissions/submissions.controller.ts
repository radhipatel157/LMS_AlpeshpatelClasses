import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto, ResubmitDto, EvaluateSubmissionDto } from './dto/submission.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser, AuthenticatedUser } from '../../common/decorators/get-user.decorator';
import { UserRole } from '@myclass/shared';

@ApiTags('Submissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly service: SubmissionsService) {}

  @Get('my')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Get student\'s own submission history (Student)' })
  getMySubmissions(@GetUser() user: AuthenticatedUser) {
    return this.service.findMySubmissions(user.id);
  }

  @Get(':assignmentId')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all submissions for an assignment (Teacher/Admin)' })
  findByAssignment(@GetUser() user: AuthenticatedUser, @Param('assignmentId') assignmentId: string) {
    return this.service.findByAssignment(user.id, user.role, assignmentId);
  }

  @Post()
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Submit assignment (Student)' })
  submit(@GetUser() user: AuthenticatedUser, @Body() dto: CreateSubmissionDto) {
    return this.service.submit(user.id, dto);
  }

  @Post(':id/resubmit')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Resubmit assignment (Student)' })
  resubmit(
    @GetUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: ResubmitDto,
  ) {
    return this.service.resubmit(user.id, id, dto);
  }

  @Patch(':id/evaluate')
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Evaluate submission with marks and remarks (Teacher/Admin)' })
  evaluate(
    @GetUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: EvaluateSubmissionDto,
  ) {
    return this.service.evaluate(user.id, user.role, id, dto);
  }
}
