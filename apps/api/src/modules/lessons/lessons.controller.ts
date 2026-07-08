import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { CreateLessonDto, UpdateLessonDto, ReorderDto, CreateResourceDto } from '../standards/dto/academic.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@myclass/shared';

@ApiTags('Lessons')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('lessons')
export class LessonsController {
  constructor(private readonly service: LessonsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all lessons, optionally filtered by chapter' })
  @ApiQuery({ name: 'chapterId', required: false })
  findAll(@Query('chapterId') chapterId?: string) {
    return this.service.findAll(chapterId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lesson detail with resources, videos, and assignments' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Create lesson (Admin/Teacher only)' })
  create(@Body() dto: CreateLessonDto) {
    return this.service.create(dto);
  }

  @Patch('reorder')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Batch reorder lessons (Admin/Teacher only)' })
  reorder(@Body() dto: ReorderDto) {
    return this.service.reorder(dto);
  }

  @Patch(':id/publish')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Publish a lesson (Admin/Teacher only)' })
  publish(@Param('id') id: string) {
    return this.service.publish(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Update lesson details (Admin/Teacher only)' })
  update(@Param('id') id: string, @Body() dto: UpdateLessonDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Soft delete/archive lesson (Admin/Teacher only)' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  // ─── Lesson Resources (PDF attachments) ───────────────────────
  @Post(':id/resources')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Add a PDF note/document to a lesson (Admin/Teacher only)' })
  addResource(@Param('id') id: string, @Body() dto: CreateResourceDto) {
    return this.service.addResource(id, dto);
  }

  @Delete(':id/resources/:resourceId')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Remove a resource from a lesson (Admin/Teacher only)' })
  removeResource(@Param('id') id: string, @Param('resourceId') resourceId: string) {
    return this.service.removeResource(id, resourceId);
  }
}
