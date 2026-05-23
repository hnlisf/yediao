import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SpotsService } from './spots.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('钓位')
@Controller('spots')
export class SpotsController {
  constructor(private readonly spotsService: SpotsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: '钓位列表' })
  async findAll(@Query('lat') lat?: number, @Query('lng') lng?: number, @Query('radius') radius?: number) {
    return this.spotsService.findAll(lat, lng, radius);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: '钓位详情' })
  async findOne(@Param('id') id: number) {
    return this.spotsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '新增钓位' })
  async create(@Body() dto: any, @Request() req) {
    return this.spotsService.create(dto, req.user.userId);
  }

  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '收藏钓位' })
  async favorite(@Param('id') id: number, @Request() req) {
    return this.spotsService.favorite(id, req.user.userId);
  }

  @Delete(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '取消收藏' })
  async unfavorite(@Param('id') id: number, @Request() req) {
    return this.spotsService.unfavorite(id, req.user.userId);
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: '钓位评论' })
  async getReviews(@Param('id') id: number) {
    return this.spotsService.getReviews(id);
  }

  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '发表评论' })
  async addReview(@Param('id') id: number, @Body() dto: any, @Request() req) {
    return this.spotsService.addReview(id, req.user.userId, dto);
  }
}
