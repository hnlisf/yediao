import { Controller, Get, Post, Put, Delete, Body, Query, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SpotService } from './spot.service';
import {
  CreateSpotDto, NearbyQueryDto, CommentDto, SpotFilterDto,
  ReviewSpotDto, UpdateSpotDto,
} from './dto/spot.dto';

@ApiTags('钓点')
@Controller('spots')
export class SpotController {
  constructor(private readonly spotService: SpotService) {}

  // ---- 公开接口 ----

  @Get('nearby')
  @ApiOperation({ summary: '附近钓点(LBS)' })
  async nearby(@Query() query: NearbyQueryDto) {
    return this.spotService.findNearby(query.lat, query.lng, query.radius, query.page, query.limit);
  }

  @Get('filter')
  @ApiOperation({ summary: '筛选钓点（按地区/类型/设施等）' })
  async filter(
    @Query() query: SpotFilterDto,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.spotService.findFiltered(
      query,
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
    );
  }

  @Get('search')
  @ApiOperation({ summary: '搜索钓点' })
  async search(
    @Query('keyword') keyword: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.spotService.search(
      keyword || '',
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: '钓点详情' })
  async detail(@Param('id') id: string, @Request() req) {
    return this.spotService.findById(id, req.user?.id);
  }

  @Get(':id/comments')
  @ApiOperation({ summary: '评论列表（顶级）' })
  async getComments(
    @Param('id') id: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.spotService.getComments(id, parseInt(page || '1', 10), parseInt(limit || '20', 10));
  }

  @Get('comments/:commentId/replies')
  @ApiOperation({ summary: '评论回复列表' })
  async getReplies(
    @Param('commentId') commentId: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.spotService.getReplies(commentId, parseInt(page || '1', 10), parseInt(limit || '20', 10));
  }

  // ---- 需登录 ----

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '新增钓点(直接通过)' })
  async create(@Request() req, @Body() dto: CreateSpotDto) {
    return this.spotService.create(req.user.id, dto);
  }

  @Post('submit')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '提交钓点审核' })
  async createForReview(@Request() req, @Body() dto: CreateSpotDto) {
    return this.spotService.createForReview(req.user.id, dto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '更新钓点（仅创建者）' })
  async update(@Request() req, @Param('id') id: string, @Body() dto: UpdateSpotDto) {
    return this.spotService.updateSpot(req.user.id, id, dto);
  }

  @Post(':id/favorite')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '收藏/取消收藏' })
  async toggleFavorite(@Request() req, @Param('id') id: string) {
    return this.spotService.toggleFavorite(req.user.id, id);
  }

  @Post(':id/comments')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '发表评论/回复' })
  async addComment(@Request() req, @Param('id') id: string, @Body() dto: CommentDto) {
    return this.spotService.addComment(req.user.id, id, dto);
  }

  @Post(':id/rate')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '评分' })
  async rateSpot(@Request() req, @Param('id') id: string, @Body('rating') rating: number) {
    return this.spotService.rateSpot(req.user.id, id, rating);
  }

  @Get('favorites/my')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '我的收藏' })
  async getUserFavorites(
    @Request() req,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.spotService.getUserFavorites(
      req.user.id,
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
    );
  }

  // =====================
  // 管理员接口（后续可加AdminGuard）
  // =====================

  @Get('admin/pending')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '待审核钓点列表（管理员）' })
  async getPendingSpots(@Query('page') page: string, @Query('limit') limit: string) {
    return this.spotService.getPendingSpots(parseInt(page || '1', 10), parseInt(limit || '20', 10));
  }

  @Post('admin/review/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '审核钓点（管理员）' })
  async reviewSpot(@Request() req, @Param('id') id: string, @Body() dto: ReviewSpotDto) {
    return this.spotService.reviewSpot(req.user.id, id, dto);
  }

  @Post('admin/batch-review')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '批量审核钓点（管理员）' })
  async batchReview(
    @Request() req,
    @Body('spotIds') spotIds: string[],
    @Body('action') action: string,
  ) {
    return this.spotService.batchReviewSpots(req.user.id, spotIds, action);
  }

  @Get('admin/comments/pending')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '待审核评论列表（管理员）' })
  async getPendingComments(@Query('page') page: string, @Query('limit') limit: string) {
    return this.spotService.getPendingComments(parseInt(page || '1', 10), parseInt(limit || '20', 10));
  }

  @Post('admin/comments/:id/review')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '审核评论（管理员）' })
  async reviewComment(@Request() req, @Param('id') id: string, @Body('action') action: string) {
    return this.spotService.reviewComment(req.user.id, id, action);
  }
}
