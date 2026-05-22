import { Controller, Get, Put, Patch, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { UpdateProfileDto, UpdatePrivacyDto, PrivacySettingsDto, BindPhoneDto } from './dto/user.dto';
import { PointsService } from '../points/points.service';

@ApiTags('用户')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly pointsService: PointsService,
  ) {}

  @Get('profile')
  @ApiOperation({ summary: '获取用户资料' })
  async getProfile(@Request() req) {
    return this.userService.findById(req.user.id);
  }

  @Get('profile/completeness')
  @ApiOperation({ summary: '获取资料完善度' })
  async getProfileCompleteness(@Request() req) {
    return this.userService.getProfileCompleteness(req.user.id);
  }

  @Get('profile/:id')
  @ApiOperation({ summary: '获取用户公开资料' })
  async getUserProfile(@Param('id') id: string, @Request() req: any) {
    return this.userService.getPublicProfile(id, req.user?.id);
  }

  @Get('points')
  @ApiOperation({ summary: '获取我的积分' })
  async getMyPoints(@Request() req: any) {
    return this.pointsService.getBalance(req.user.id);
  }

  @Get('points/history')
  @ApiOperation({ summary: '积分历史' })
  async getPointsHistory(@Query('page') page: string, @Query('limit') limit: string, @Request() req: any) {
    return this.userService.getPointsHistory(req.user.id, parseInt(page || '1', 10), parseInt(limit || '20', 10));
  }

  @Put('profile')
  @ApiOperation({ summary: '更新用户资料' })
  async updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(req.user.id, dto);
  }

  @Put('privacy')
  @ApiOperation({ summary: '更新隐私设置' })
  async updatePrivacy(@Request() req, @Body() dto: UpdatePrivacyDto) {
    return this.userService.updatePrivacy(req.user.id, dto);
  }

  @Patch('profile')
  @ApiOperation({ summary: '部分更新用户资料' })
  async patchProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(req.user.id, dto);
  }

  @Patch('privacy')
  @ApiOperation({ summary: '部分更新隐私设置' })
  async patchPrivacy(@Request() req, @Body() dto: PrivacySettingsDto) {
    return this.userService.updatePrivacy(req.user.id, dto);
  }

  @Post('bind-phone/send-code')
  @ApiOperation({ summary: '发送绑定手机验证码' })
  async sendBindCode(@Body('phone') phone: string) {
    return this.userService.sendBindCode(phone);
  }

  @Post('bind-phone')
  @ApiOperation({ summary: '绑定手机号' })
  async bindPhone(@Request() req, @Body() dto: BindPhoneDto) {
    return this.userService.bindPhone(req.user.id, dto);
  }
}
