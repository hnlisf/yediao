import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, SendCodeDto, WeChatAuthDto, AlipayAuthDto, OAuthLoginDto } from './dto/auth.dto';
import { OAuthProvider } from '../../entities/user.entity';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('send-code')
  @ApiOperation({ summary: '发送验证码' })
  async sendCode(@Body() dto: SendCodeDto) {
    return this.authService.sendCode(dto);
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('oauth/wechat')
  @ApiOperation({ summary: '微信OAuth登录' })
  async wechatAuth(@Body() dto: WeChatAuthDto) {
    return this.authService.oauthLogin({
      provider: OAuthProvider.WECHAT,
      code: dto.code,
      openId: dto.openid,
    });
  }

  @Public()
  @Post('oauth/alipay')
  @ApiOperation({ summary: '支付宝OAuth登录' })
  async alipayAuth(@Body() dto: AlipayAuthDto) {
    return this.authService.oauthLogin({
      provider: OAuthProvider.ALIPAY,
      code: dto.code,
      openId: dto.userId,
    });
  }

  @Public()
  @Post('oauth/login')
  @ApiOperation({ summary: 'OAuth登录' })
  async oauthLogin(@Body() dto: OAuthLoginDto) {
    return this.authService.oauthLogin(dto);
  }
}
