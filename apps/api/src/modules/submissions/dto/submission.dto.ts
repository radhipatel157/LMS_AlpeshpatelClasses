import {
  IsString,
  IsInt,
  IsOptional,
  IsArray,
  IsUUID,
  IsUrl,
  IsIn,
  Min,
  Max,
  ArrayMaxSize,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ALLOWED_SUBMISSION_MIME_TYPES, MAX_FILE_SIZE_BYTES } from '@myclass/shared';

export class SubmissionFileDto {
  @ApiProperty({ example: 'https://res.cloudinary.com/...' })
  @IsUrl({ require_protocol: true })
  url!: string;

  @ApiPropertyOptional({ example: 'application/pdf' })
  @IsOptional()
  @IsString()
  @IsIn(ALLOWED_SUBMISSION_MIME_TYPES)
  mimeType?: string;

  @ApiPropertyOptional({ example: 1024000 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(MAX_FILE_SIZE_BYTES)
  fileSize?: number;

  @ApiPropertyOptional({ example: 'homework.pdf' })
  @IsOptional()
  @IsString()
  fileName?: string;
}

export class CreateSubmissionDto {
  @ApiProperty()
  @IsUUID()
  assignmentId!: string;

  @ApiProperty({ type: [SubmissionFileDto] })
  @IsArray()
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => SubmissionFileDto)
  files!: SubmissionFileDto[];
}

export class ResubmitDto {
  @ApiProperty({ type: [SubmissionFileDto] })
  @IsArray()
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => SubmissionFileDto)
  files!: SubmissionFileDto[];
}

export class EvaluateSubmissionDto {
  @ApiProperty({ example: 85 })
  @IsInt()
  @Min(0)
  marks!: number;

  @ApiPropertyOptional({ example: 'Well done! Keep it up.' })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiProperty({ example: 'approved', description: 'approved or rejected' })
  @IsString()
  status!: string;
}
  
