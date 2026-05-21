import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ImService } from './im.service';

@ApiTags('IM')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('im')
export class ImController {
  constructor(private readonly imService: ImService) {}

  @Get('token')
  @ApiOperation({ summary: '获取IM Token' })
  async getToken(@Request() req) {
    return this.imService.getToken(req.user.id, req.user.nickname, req.user.avatar);
  }

  @Post('groups')
  @ApiOperation({ summary: '创建群组' })
  async createGroup(@Request() req, @Body() dto: { groupName: string; memberIds: string[] }) {
    return this.imService.createGroup(req.user.id, dto.groupName, dto.memberIds);
  }
}
