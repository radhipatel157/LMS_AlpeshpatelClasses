import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto, UpdateAssignmentDto } from './dto/assignment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser, AuthenticatedUser } from '../../common/decorators/get-user.decorator';
import { UserRole } from '@myclass/shared';

@ApiTags('Assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly service: AssignmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all assignments, optionally filtered by lesson' })
  @ApiQuery({ name: 'lessonId', required: false })
  findAll(@Query('lessonId') lessonId?: string) {
    return this.service.findAll(lessonId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of an assignment with all student submissions' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Create assignment (Admin/Teacher only)' })
  create(@GetUser() user: AuthenticatedUser, @Body() dto: CreateAssignmentDto) {
    return this.service.create(user.id, dto);
  }

  @Patch(':id/publish')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Publish assignment and notify students (Admin/Teacher only)' })
  publish(@Param('id') id: string) {
    return this.service.publish(id);
  }

  @Patch(':id/close')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Close assignment to halt standard submissions (Admin/Teacher only)' })
  close(@Param('id') id: string) {
    return this.service.close(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Update assignment details (Admin/Teacher only)' })
  update(@Param('id') id: string, @Body() dto: UpdateAssignmentDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Soft delete assignment (Admin/Teacher only)' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
