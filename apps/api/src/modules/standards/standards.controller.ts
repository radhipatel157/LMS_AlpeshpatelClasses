import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { StandardsService } from './standards.service';
import { CreateStandardDto, UpdateStandardDto } from './dto/academic.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@myclass/shared';

@ApiTags('Standards')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('standards')
export class StandardsController {
  constructor(private readonly service: StandardsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all standards' })
  findAll() { return this.service.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Get standard with subjects' })
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create standard (Admin)' })
  create(@Body() dto: CreateStandardDto) { return this.service.create(dto); }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update standard (Admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateStandardDto) { return this.service.update(id, dto); }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Archive standard (Admin)' })
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
