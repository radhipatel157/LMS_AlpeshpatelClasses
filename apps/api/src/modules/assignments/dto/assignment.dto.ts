import {
  IsString,
  IsInt,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsArray,
  Min,
  IsUUID,
  IsUrl,
  Max,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MAX_FILE_SIZE_BYTES } from '@myclass/shared';

export class AssignmentAttachmentDto {
  @ApiProperty({ example: 'https://res.cloudinary.com/...' })
  @IsUrl({ require_protocol: true })
  url: string;

  @ApiPropertyOptional({ example: 'lesson-notes.pdf' })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiPropertyOptional({ example: 'application/pdf' })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiPropertyOptional({ example: 1024000 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(MAX_FILE_SIZE_BYTES)
  fileSize?: number;
}

export class CreateAssignmentDto {
  @ApiProperty()
  @IsUUID()
  lessonId: string;

  @ApiProperty({ example: 'Algebra Worksheet 1' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Solve all questions from section A and B' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2026-07-15T23:59:59.000Z' })
  @IsDateString()
  dueDate: string;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(1)
  maxMarks: number;

  @ApiPropertyOptional({ type: [String], default: ['pdf'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedFileTypes?: string[];

  @ApiPropertyOptional({ type: [AssignmentAttachmentDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssignmentAttachmentDto)
  attachments?: AssignmentAttachmentDto[];

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  allowResubmission?: boolean;
}

export class UpdateAssignmentDto extends PartialType(CreateAssignmentDto) {}

export class SubmitAssignmentDto {
  @ApiProperty({ example: 'https://res.cloudinary.com/...' })
  @IsString()
  fileUrl: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  fileSize?: number;
}

export class EvaluateSubmissionDto {
  @ApiProperty({ example: 85 })
  @IsInt()
  @Min(0)
  marks: number;

  @ApiPropertyOptional({ example: 'Well done! Keep it up.' })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiProperty({ example: 'APPROVED', description: 'Evaluation decision status' })
  @IsString()
  status: string; // e.g. APPROVED or REJECTED
}
