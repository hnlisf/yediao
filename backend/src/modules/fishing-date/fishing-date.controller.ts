import { Controller, Get, Post, Put, Delete, Body, Query, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FishingDateService } from './fishing-date.service';

@ApiTags('约钓')
@Controller('fishing-dates')
export class FishingDateController {
  constructor(private readonly fishingDateService: FishingDateService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '发起约钓' })
  async create(@Request() req, @Body() dto: any) {
    return this.fishingDateService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: '约钓列表' })
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('status') status?: string,
  ) {
    return this.fishingDateService.findAll(
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
      status,
    );
  }

  @Get('my')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '我的约钓' })
  async getMyEvents(
    @Request() req,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.fishingDateService.getMyEvents(
      req.user.id,
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: '约钓详情' })
  async findById(@Param('id') id: string, @Request() req) {
    return this.fishingDateService.findById(id, req.user?.id);
  }

  @Get(':id/participants')
  @ApiOperation({ summary: '参与者列表' })
  async getParticipants(
    @Param('id') id: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.fishingDateService.getParticipants(
      id,
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
    );
  }

  @Post(':id/join')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '报名' })
  async join(@Request() req, @Param('id') id: string) {
    return this.fishingDateService.join(req.user.id, id);
  }

  @Delete(':id/join')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '取消报名' })
  async cancelJoin(@Request() req, @Param('id') id: string) {
    return this.fishingDateService.cancelJoin(req.user.id, id);
  }

  @Put(':id/participants/:participantId/confirm')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '确认参与者' })
  async confirmParticipant(
    @Request() req,
    @Param('id') id: string,
    @Param('participantId') participantId: string,
  ) {
    return this.fishingDateService.confirmParticipant(req.user.id, id, participantId);
  }

  @Put(':id/close')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '关闭活动' })
  async close(@Request() req, @Param('id') id: string) {
    return this.fishingDateService.close(req.user.id, id);
  }
}