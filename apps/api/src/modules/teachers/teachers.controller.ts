import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto, UpdateTeacherDto } from './dto/teacher.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser, AuthenticatedUser } from '../../common/decorators/get-user.decorator';
import { UserRole } from '@myclass/shared';

@ApiTags('Teachers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('teachers')
export class TeachersController {
  constructor(private readonly service: TeachersService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List teacher profiles (Admin)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('page') page = 1,
    @Query('perPage') perPage = 20,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(+page, +perPage, search);
  }

  @Get('me')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Get own teacher profile (Teacher)' })
  getMyProfile(@GetUser() user: AuthenticatedUser) {
    return this.service.findByUserId(user.id);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get teacher profile by ID (Admin)' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create teacher profile (Admin)' })
  create(@Body() dto: CreateTeacherDto) {
    return this.service.create(dto);
  }

  @Patch('me')
  @Roles(UserRole.TEACHER)
  @ApiOperation({ summary: 'Update own teacher profile (Teacher)' })
  updateMyProfile(@GetUser() user: AuthenticatedUser, @Body() dto: UpdateTeacherDto) {
    return this.service.findByUserId(user.id).then((t) => this.service.update(t.id, dto));
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update teacher profile (Admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateTeacherDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete teacher profile (Admin)' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
