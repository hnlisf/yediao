import { Controller, Get, Post, Put, Body, Query, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SpotAuditService } from './spot-audit.service';

@ApiTags('钓点审核')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('spot-audit')
export class SpotAuditController {
  constructor(private readonly spotAuditService: SpotAuditService) {}

  @Get('pending')
  @ApiOperation({ summary: '待审核列表' })
  async findPending(
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.spotAuditService.findPending(
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
    );
  }

  @Get('stats')
  @ApiOperation({ summary: '审核统计' })
  async getStats() {
    return this.spotAuditService.getStats();
  }

  @Get(':spotId/history')
  @ApiOperation({ summary: '审核历史' })
  async getReviewHistory(
    @Param('spotId') spotId: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.spotAuditService.getReviewHistory(
      spotId,
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
    );
  }

  @Put(':spotId/approve')
  @ApiOperation({ summary: '通过审核' })
  async approve(
    @Request() req,
    @Param('spotId') spotId: string,
    @Body('note') note?: string,
  ) {
    return this.spotAuditService.approve(req.user.id, spotId, note);
  }

  @Put(':spotId/reject')
  @ApiOperation({ summary: '拒绝审核' })
  async reject(
    @Request() req,
    @Param('spotId') spotId: string,
    @Body('note') note?: string,
  ) {
    return this.spotAuditService.reject(req.user.id, spotId, note);
  }
}