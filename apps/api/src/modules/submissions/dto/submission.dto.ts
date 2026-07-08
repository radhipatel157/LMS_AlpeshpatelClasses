import { IsString, IsInt, IsOptional, IsArray, IsUUID, Min, Max, ArrayMaxSize, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SubmissionFileDto {
  @ApiProperty({ example: 'https://res.cloudinary.com/...' })
  @IsString()
  url: string;

  @ApiPropertyOptional({ example: 'application/pdf' })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiPropertyOptional({ example: 1024000 })
  @IsOptional()
  @IsInt()
  fileSize?: number;

  @ApiPropertyOptional({ example: 'homework.pdf' })
  @IsOptional()
  @IsString()
  fileName?: string;
}

export class CreateSubmissionDto {
  @ApiProperty()
  @IsUUID()
  assignmentId: string;

  @ApiProperty({ type: [SubmissionFileDto] })
  @IsArray()
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => SubmissionFileDto)
  files: SubmissionFileDto[];
}

export class ResubmitDto {
  @ApiProperty({ type: [SubmissionFileDto] })
  @IsArray()
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => SubmissionFileDto)
  files: SubmissionFileDto[];
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

  @ApiProperty({ example: 'approved', description: 'approved or rejected' })
  @IsString()
  status: string;
}
