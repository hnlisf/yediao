import { Controller, Post, Get, Body, Query, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AiService } from './ai.service';

@ApiTags('AI识鱼')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('recognize')
  @ApiOperation({ summary: '识别鱼类' })
  async recognize(@Request() req, @Body('imageUrl') imageUrl: string) {
    return this.aiService.recognize(imageUrl, req.user.id);
  }

  @Get('history')
  @ApiOperation({ summary: '识别历史' })
  async getHistory(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Request() req: any,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '20', 10);
    return this.aiService.getHistory(req.user?.id, { page: pageNum, limit: limitNum });
  }

  @Get('history/:id')
  @ApiOperation({ summary: '识别历史详情' })
  async getHistoryById(@Param('id') id: string, @Request() req: any) {
    return this.aiService.getHistoryById(req.user?.id, id);
  }

  @Post('release/:id')
  @ApiOperation({ summary: '放生鱼类（+10积分）' })
  async markReleased(@Param('id') id: string, @Request() req: any) {
    return this.aiService.markReleased(req.user?.id, id);
  }

  @Post('report/:id')
  @ApiOperation({ summary: '上报鱼类记录' })
  async markReported(@Param('id') id: string, @Request() req: any) {
    return this.aiService.markReported(req.user?.id, id);
  }
}
