import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto, UpdateStudentDto } from './dto/student.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser, AuthenticatedUser } from '../../common/decorators/get-user.decorator';
import { UserRole } from '@myclass/shared';

@ApiTags('Students')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly service: StudentsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'List student profiles (Admin/Teacher)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  @ApiQuery({ name: 'standardId', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('page') page = 1,
    @Query('perPage') perPage = 20,
    @Query('standardId') standardId?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(+page, +perPage, standardId, search);
  }

  @Get('me')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Get own student profile (Student)' })
  getMyProfile(@GetUser() user: AuthenticatedUser) {
    return this.service.findByUserId(user.id);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Get student profile by ID (Admin/Teacher)' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create student profile (Admin)' })
  create(@Body() dto: CreateStudentDto) {
    return this.service.create(dto);
  }

  @Patch('me')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Update own student profile (Student)' })
  updateMyProfile(@GetUser() user: AuthenticatedUser, @Body() dto: UpdateStudentDto) {
    return this.service.findByUserId(user.id).then((s) => this.service.update(s.id, dto));
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update student profile (Admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete student profile (Admin)' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
