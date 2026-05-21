import { Controller, Get, Post, Body, Param, UseGuards, Request, Query, UseInterceptors, UploadedFile, UploadedFiles } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SocialService } from './social.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from '../modules/upload/upload.service';

@ApiTags('社区')
@Controller('social')
export class SocialController {
  constructor(
    private readonly socialService: SocialService,
    private readonly uploadService: UploadService,
  ) {}

  @Get('posts')
  @ApiOperation({ summary: '动态列表' })
  async getPosts(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.socialService.getPosts(page, limit);
  }

  @Post('posts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '发布动态' })
  @UseInterceptors(FilesInterceptor('images', 9))
  async createPost(
    @Body() dto: any,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req,
  ) {
    let imageUrls: string[] = [];
    if (files && files.length > 0) {
      imageUrls = await Promise.all(files.map((f) => this.uploadService.uploadToOSS(f)));
    }
    return this.socialService.createPost({ ...dto, images: imageUrls }, req.user.userId);
  }

  @Post('posts/:id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '点赞' })
  async likePost(@Param('id') id: number, @Request() req) {
    return this.socialService.likePost(id, req.user.userId);
  }

  @Get('posts/:id/comments')
  @ApiOperation({ summary: '评论列表' })
  async getComments(@Param('id') id: number) {
    return this.socialService.getComments(id);
  }

  @Post('posts/:id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '发表评论' })
  async addComment(@Param('id') id: number, @Body() dto: any, @Request() req) {
    return this.socialService.addComment(id, req.user.userId, dto);
  }

  @Get('events')
  @ApiOperation({ summary: '约钓列表' })
  async getEvents() {
    return this.socialService.getEvents();
  }

  @Post('events')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '发起约钓' })
  async createEvent(@Body() dto: any, @Request() req) {
    return this.socialService.createEvent(dto, req.user.userId);
  }

  @Get('events/:id')
  @ApiOperation({ summary: '约钓详情' })
  async getEventDetail(@Param('id') id: number) {
    return this.socialService.getEventDetail(id);
  }

  @Post('events/:id/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '报名约钓' })
  async joinEvent(@Param('id') id: number, @Request() req) {
    return this.socialService.joinEvent(id, req.user.userId);
  }

  @Post('events/:id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '取消报名' })
  async cancelEvent(@Param('id') id: number, @Request() req) {
    return this.socialService.cancelEvent(id, req.user.userId);
  }
}
