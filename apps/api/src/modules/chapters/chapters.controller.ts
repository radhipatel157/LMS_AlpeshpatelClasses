import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ChaptersService } from './chapters.service';
import { CreateChapterDto, UpdateChapterDto, ReorderDto } from '../standards/dto/academic.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@myclass/shared';

@ApiTags('Chapters')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('chapters')
export class ChaptersController {
  constructor(private readonly service: ChaptersService) {}

  @Get()
  @ApiOperation({ summary: 'Get chapters, optionally filtered by subject' })
  @ApiQuery({ name: 'subjectId', required: false })
  findAll(@Query('subjectId') subjectId?: string) {
    return this.service.findAll(subjectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get chapter detail with nested lessons' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Create chapter (Admin/Teacher only)' })
  create(@Body() dto: CreateChapterDto) {
    return this.service.create(dto);
  }

  @Patch('reorder')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Batch reorder chapters (Admin/Teacher only)' })
  reorder(@Body() dto: ReorderDto) {
    return this.service.reorder(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Update chapter (Admin/Teacher only)' })
  update(@Param('id') id: string, @Body() dto: UpdateChapterDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Soft delete/archive chapter (Admin/Teacher only)' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
