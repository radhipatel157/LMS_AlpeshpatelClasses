import { IsString, IsOptional, IsInt, IsBoolean, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateStandardDto {
  @ApiProperty({ example: 'Class 10' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
export class UpdateStandardDto extends PartialType(CreateStandardDto) {}

export class CreateSubjectDto {
  @ApiProperty()
  @IsString()
  standardId: string;

  @ApiProperty({ example: 'Mathematics' })
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
export class UpdateSubjectDto extends PartialType(CreateSubjectDto) {}

export class CreateChapterDto {
  @ApiProperty()
  @IsString()
  subjectId: string;

  @ApiProperty({ example: 'Algebra' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
export class UpdateChapterDto extends PartialType(CreateChapterDto) {}

export class CreateLessonDto {
  @ApiProperty()
  @IsString()
  chapterId: string;

  @ApiProperty({ example: 'Linear Equations' })
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
export class UpdateLessonDto extends PartialType(CreateLessonDto) {}

export class ReorderDto {
  @ApiProperty({ type: [String], description: 'IDs in the new order' })
  ids: string[];
}

export class CreateResourceDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'https://res.cloudinary.com/...' })
  @IsString()
  fileUrl: string;

  @ApiPropertyOptional({ default: 'pdf' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  fileSize?: number;
}
