import { Controller, Get, Post, Delete, Body, Query, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CommunityService } from './community.service';

@ApiTags('社区')
@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Post('posts')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '发布动态' })
  async createPost(@Request() req, @Body() dto: {
    content: string;
    images?: string[];
    taggedSpecies?: string[];
    taggedSpots?: string[];
    videoUrl?: string;
    contentType?: string;
  }) {
    return this.communityService.createPost(req.user.id, dto);
  }

  @Get('posts')
  @ApiOperation({ summary: '动态列表' })
  async getPosts(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Request() req,
  ) {
    return this.communityService.getPosts(
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
      req.user?.id,
    );
  }

  @Get('posts/user/:userId')
  @ApiOperation({ summary: '用户动态列表' })
  async getUserPosts(
    @Param('userId') userId: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.communityService.getUserPosts(
      userId,
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
    );
  }

  @Get('posts/:id')
  @ApiOperation({ summary: '动态详情' })
  async getPostById(@Param('id') id: string, @Request() req) {
    return this.communityService.getPostById(id, req.user?.id);
  }

  @Post('posts/:id/like')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '点赞/取消点赞' })
  async toggleLike(@Request() req, @Param('id') id: string) {
    return this.communityService.toggleLike(req.user.id, id);
  }

  @Post('posts/:id/comments')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '评论' })
  async addComment(@Request() req, @Param('id') id: string, @Body('content') content: string) {
    return this.communityService.addComment(req.user.id, id, content);
  }

  @Get('posts/:id/comments')
  @ApiOperation({ summary: '评论列表' })
  async getComments(
    @Param('id') id: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.communityService.getComments(
      id,
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
    );
  }

  @Post('posts/:id/share')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '分享动态' })
  async sharePost(@Request() req, @Param('id') id: string) {
    return this.communityService.sharePost(req.user.id, id);
  }

  @Delete('posts/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '删除动态' })
  async deletePost(@Request() req, @Param('id') id: string) {
    return this.communityService.deletePost(req.user.id, id);
  }
}