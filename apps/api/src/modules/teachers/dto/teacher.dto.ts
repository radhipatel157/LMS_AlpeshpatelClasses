import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateTeacherDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({ example: 'M.Sc. Mathematics, B.Ed.' })
  @IsOptional()
  @IsString()
  qualification?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bio?: string;
}

export class UpdateTeacherDto extends PartialType(CreateTeacherDto) {}
