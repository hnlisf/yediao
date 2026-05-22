import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { User, OAuthProvider } from '../entities/user.entity';
import { AuthService } from './auth.service';

@Injectable()
export class OAuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private authService: AuthService,
  ) {}

  getWechatAuthUrl(): string {
    const appId = process.env.WEIXIN_APP_ID;
    const redirectUri = encodeURIComponent(process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000/auth/oauth/wechat/callback');
    const state = Math.random().toString(36).substring(7);
    return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_userinfo&state=${state}#wechat_redirect`;
  }

  getAlipayAuthUrl(): string {
    const appId = process.env.ALIPAY_APP_ID;
    const redirectUri = encodeURIComponent(process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000/auth/oauth/alipay/callback');
    const state = Math.random().toString(36).substring(7);
    return `https://openauth.alipay.com/oauth2/publicAppAuthorize.htm?app_id=${appId}&redirect_uri=${redirectUri}&scope=auth_userinfo&state=${state}`;
  }

  async handleWechatCallback(code: string): Promise<{ token: string; userId: number | string }> {
    const appId = process.env.WEIXIN_APP_ID;
    const appSecret = process.env.WEIXIN_APP_SECRET;
    const tokenUrl = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=***&code=***&grant_type=authorization_code`;

    let openid: string;
    let unionid: string | undefined;

    try {
      const tokenRes = await axios.get(tokenUrl);
      if (!tokenRes.data.openid) {
        throw new InternalServerErrorException('Failed to get openid from WeChat');
      }
      openid = tokenRes.data.openid;
      unionid = tokenRes.data.unionid;
    } catch (error) {
      throw new InternalServerErrorException(`WeChat token exchange failed: ${error.message}`);
    }

    const user = await this.findOrCreateOAuthUser(OAuthProvider.WECHAT, openid, unionid);
    const token = this.authService.generateToken(user);

    return { token, userId: user.id };
  }

  async handleAlipayCallback(code: string): Promise<{ token: string; userId: number | string }> {
    // Alipay requires RSA2 signed requests which needs alipay-sdk.
    // MVP: mock openid derived from code. In production, integrate alipay-sdk.
    const openid = `alipay_${code}_mock`;
    const unionid = undefined;

    const user = await this.findOrCreateOAuthUser(OAuthProvider.ALIPAY, openid, unionid);
    const token = this.authService.generateToken(user);

    return { token, userId: user.id };
  }

  private async findOrCreateOAuthUser(
    provider: OAuthProvider,
    openid: string,
    unionid?: string,
  ): Promise<User> {
    let user = await this.userRepo.findOne({
      where: { oauthProvider: provider, oauthOpenId: openid },
    });

    if (!user && unionid) {
      user = await this.userRepo.findOne({
        where: { oauthUnionId: unionid },
      });
    }

    if (!user) {
      user = this.userRepo.create({
        phone: `oauth_${openid.substring(0, 20)}`,
        nickname: provider === OAuthProvider.WECHAT ? '微信用户' : '支付宝用户',
        oauthProvider: provider,
        oauthOpenId: openid,
        oauthUnionId: unionid,
        privacySettings: {
          show_fishing_age: true,
          show_frequent_spot: true,
          show_skilled_fish: true,
          show_posts: true,
          show_friends: true,
          allow_push: true,
        },
        skilledFish: [],
      });
      await this.userRepo.save(user);
    } else {
      // Update OAuth info on login
      if (user.oauthProvider !== provider) {
        user.oauthProvider = provider;
      }
      if (user.oauthOpenId !== openid) {
        user.oauthOpenId = openid;
      }
      if (unionid && user.oauthUnionId !== unionid) {
        user.oauthUnionId = unionid;
      }
      await this.userRepo.save(user);
    }

    return user;
  }
}
