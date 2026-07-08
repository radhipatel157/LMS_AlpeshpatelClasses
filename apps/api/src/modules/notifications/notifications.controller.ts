import { Controller, Get, Patch, Delete, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { BroadcastNotificationDto } from './dto/notification.dto';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser, AuthenticatedUser } from '../../common/decorators/get-user.decorator';
import { UserRole } from '@myclass/shared';

@ApiTags('Notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications (paginated)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  findAll(
    @GetUser() user: AuthenticatedUser,
    @Query('page') page = 1,
    @Query('perPage') perPage = 20,
  ) {
    return this.service.findAll(user.id, +page, +perPage);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count for badge' })
  getUnreadCount(@GetUser() user: AuthenticatedUser) {
    return this.service.getUnreadCount(user.id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllAsRead(@GetUser() user: AuthenticatedUser) {
    return this.service.markAllAsRead(user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a single notification as read' })
  markAsRead(@GetUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.service.markAsRead(user.id, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  remove(@GetUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.service.remove(user.id, id);
  }

  @Post('broadcast')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Broadcast notification to all users or a role group (Admin)' })
  broadcast(@Body() dto: BroadcastNotificationDto) {
    return this.service.broadcast(dto);
  }
}
