import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { VideosService } from './videos.service';
import { CreateVideoDto, UpdateVideoDto } from './dto/video.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@myclass/shared';

@ApiTags('Videos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('videos')
export class VideosController {
  constructor(private readonly service: VideosService) {}

  @Get()
  @ApiOperation({ summary: 'Get all videos, optionally filtered by lesson' })
  @ApiQuery({ name: 'lessonId', required: false })
  findAll(@Query('lessonId') lessonId?: string) {
    return this.service.findAll(lessonId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get video details' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Create video record (Admin/Teacher only)' })
  create(@Body() dto: CreateVideoDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Update video metadata (Admin/Teacher only)' })
  update(@Param('id') id: string, @Body() dto: UpdateVideoDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Soft-delete video record (Admin/Teacher only)' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
