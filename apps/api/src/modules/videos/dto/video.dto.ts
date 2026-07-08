import { IsString, IsInt, IsOptional, Min, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateVideoDto {
  @ApiProperty({ example: '32e7ef63-9585-48b0-8f9f-cc70d0328b03' })
  @IsUUID()
  lessonId: string;

  @ApiProperty({ example: 'Introduction to Algebra' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'dQw4w9WgXcQ', description: 'YouTube Video ID or YouTube URL' })
  @IsString()
  youtubeIdOrUrl: string;

  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/...' })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiProperty({ example: 600, description: 'Duration in seconds' })
  @IsInt()
  @Min(1)
  duration: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

export class UpdateVideoDto extends PartialType(CreateVideoDto) {}

export class VideoHeartbeatDto {
  @ApiProperty()
  @IsUUID()
  videoId: string;

  @ApiProperty({ description: 'Current playback position in seconds' })
  @IsInt()
  @Min(0)
  currentPosition: number;

  @ApiProperty({ description: 'Total seconds watched in this specific session' })
  @IsInt()
  @Min(0)
  watchedSeconds: number;

  @ApiProperty({ description: 'Completion percentage (0.00 to 100.00)' })
  @Min(0)
  completionPercentage: number;

  @ApiProperty({ description: 'Client-generated UUID for the playback session' })
  @IsString()
  sessionId: string;
}
