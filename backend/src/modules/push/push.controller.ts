import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PushService } from './push.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('推送')
@Controller('push')
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @Post('send')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '推送消息给当前用户' })
  async send(@Body() body: { title: string; content: string; extras?: Record<string, any> }, @Request() req) {
    return this.pushService.pushToUser(req.user.userId, body.title, body.content, body.extras);
  }

  @Post('broadcast')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '广播推送（全量）' })
  async broadcast(@Body() body: { title: string; content: string; extras?: Record<string, any> }) {
    return this.pushService.broadcast(body.title, body.content, body.extras);
  }
}
