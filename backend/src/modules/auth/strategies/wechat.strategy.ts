import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import axios from 'axios';

/**
 * WeChat OAuth2 Passport Strategy
 * Extends passport-oauth2 with WeChat-specific authorization URL format.
 * WeChat requires the #wechat_redirect suffix in the authorization URL.
 */
export class WechatStrategy extends OAuth2Strategy {
  private readonly callbackURL: string;

  constructor() {
    const cb = process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000/auth/oauth/wechat/callback';
    super({
      authorizationURL: 'https://open.weixin.qq.com/connect/oauth2/authorize',
      tokenURL: 'https://api.weixin.qq.com/sns/oauth2/access_token',
      clientID: process.env.WEIXIN_APP_ID || '',
      clientSecret: process.env.WEIXIN_APP_SECRET || '',
      callbackURL: cb,
      scope: 'snsapi_userinfo',
      state: true,
    }, (accessToken: string, refreshToken: string, profile: unknown, done: (err: Error | null, profile: unknown) => void) => {
      done(null, profile);
    });
    this.callbackURL = cb;
  }

  /**
   * Override to append #wechat_redirect (WeChat-specific requirement)
   */
  getAuthorizationUrl(options: Record<string, unknown>) {
    const appId = process.env.WEIXIN_APP_ID || '';
    const redirectUri = encodeURIComponent((options.callbackURL as string) || this.callbackURL);
    const state = (options.state as string) || Math.random().toString(36).substring(7);
    const scope = (options.scope as string) || 'snsapi_userinfo';
    return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`;
  }

  /**
   * Fetch WeChat user profile using the access token
   */
  async userProfile(accessToken: string): Promise<Record<string, unknown>> {
    try {
      const response = await axios.get('https://api.weixin.qq.com/sns/userinfo', {
        params: { access_token: accessToken, openid: '' },
        headers: { Accept: 'application/json' },
      });
      return {
        provider: 'wechat',
        id: response.data.openid,
        unionid: response.data.unionid,
        nickname: response.data.nickname,
        avatar: response.data.headimgurl,
        _raw: response.data,
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to fetch WeChat user profile: ${msg}`);
    }
  }
}
