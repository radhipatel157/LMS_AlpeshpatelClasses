import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@myclass/shared';

export class BroadcastNotificationDto {
  @ApiProperty({ example: 'System Maintenance' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'The platform will be under maintenance tonight from 11 PM to 1 AM.' })
  @IsString()
  body: string;

  @ApiPropertyOptional({ example: '/student/dashboard' })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiPropertyOptional({ enum: UserRole, description: 'Target role group. Omit to broadcast to all users.' })
  @IsOptional()
  @IsEnum(UserRole)
  targetRole?: UserRole;
}
