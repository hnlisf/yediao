import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PointsService } from './points.service';
import { EarnPointsDto, SpendPointsDto, PointRecordQueryDto } from './dto/points.dto';

@ApiTags('积分')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('points')
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Get('balance')
  @ApiOperation({ summary: '获取积分余额' })
  async getBalance(@Request() req) {
    return this.pointsService.getBalance(req.user.id);
  }

  @Get('config')
  @ApiOperation({ summary: '获取积分配置' })
  async getConfig() {
    return this.pointsService.getPointsConfig();
  }

  @Post('checkin')
  @ApiOperation({ summary: '每日签到' })
  async dailyCheckin(@Request() req) {
    return this.pointsService.dailyCheckin(req.user.id);
  }

  @Post('earn')
  @ApiOperation({ summary: '积分奖励' })
  async earnPoints(@Request() req, @Body() dto: EarnPointsDto) {
    return this.pointsService.earnPoints(req.user.id, dto);
  }

  @Post('spend')
  @ApiOperation({ summary: '积分消费' })
  async spendPoints(@Request() req, @Body() dto: SpendPointsDto) {
    return this.pointsService.spendPoints(req.user.id, dto);
  }

  @Get('records')
  @ApiOperation({ summary: '获取积分记录' })
  async getRecords(@Request() req, @Query() query: PointRecordQueryDto) {
    return this.pointsService.getPointRecords(req.user.id, query);
  }
}
