import { Controller, Post, Get, Body, Param, UseGuards, Request, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FishService } from './fish.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('AI识鱼')
@Controller('fish')
export class FishController {
  constructor(private readonly fishService: FishService) {}

  @Post('recognize')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '图片识别鱼类' })
  async recognize(@UploadedFile() file: Express.Multer.File, @Request() req) {
    return this.fishService.recognize(file, req.user.userId);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '识别历史' })
  async getHistory(@Request() req) {
    return this.fishService.getHistory(req.user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '识别详情' })
  async getDetail(@Param('id') id: number) {
    return this.fishService.getDetail(id);
  }
}
