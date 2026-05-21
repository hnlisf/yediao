import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { OAuthService } from './oauth.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('OAuth')
@Controller('auth/oauth')
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  @Public()
  @Get('wechat')
  @ApiOperation({ summary: '微信OAuth授权' })
  wechatAuth() {
    const url = this.oauthService.getWechatAuthUrl();
    return { url };
  }

  @Public()
  @Get('alipay')
  @ApiOperation({ summary: '支付宝OAuth授权' })
  alipayAuth() {
    const url = this.oauthService.getAlipayAuthUrl();
    return { url };
  }

  @Public()
  @Get('wechat/callback')
  @ApiOperation({ summary: '微信OAuth回调' })
  async wechatCallback(@Query('code') code: string, @Res() res: Response) {
    if (!code) {
      return res.redirect('/login?error=no_code');
    }
    try {
      const { token, userId } = await this.oauthService.handleWechatCallback(code);
      return res.redirect(`/login/oauth-callback?token=${token}&userId=${userId}`);
    } catch (error) {
      return res.redirect(`/login?error=${encodeURIComponent(error.message)}`);
    }
  }

  @Public()
  @Get('alipay/callback')
  @ApiOperation({ summary: '支付宝OAuth回调' })
  async alipayCallback(@Query('code') code: string, @Res() res: Response) {
    if (!code) {
      return res.redirect('/login?error=no_code');
    }
    try {
      const { token, userId } = await this.oauthService.handleAlipayCallback(code);
      return res.redirect(`/login/oauth-callback?token=${token}&userId=${userId}`);
    } catch (error) {
      return res.redirect(`/login?error=${encodeURIComponent(error.message)}`);
    }
  }
}