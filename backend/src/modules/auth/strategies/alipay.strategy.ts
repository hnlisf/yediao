import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import * as crypto from 'crypto';

/**
 * Alipay OAuth2 Passport Strategy
 * Extends passport-oauth2 with Alipay-specific authorization URL format.
 * Note: Alipay requires RSA2 signing in production. This is a simplified MVP version.
 */
export class AlipayStrategy extends OAuth2Strategy {
  private readonly callbackURL: string;

  constructor() {
    const cb = process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000/auth/oauth/alipay/callback';
    super({
      authorizationURL: 'https://openauth.alipay.com/oauth2/publicAppAuthorize.htm',
      tokenURL: 'https://open.alipay.com/auth30',
      clientID: process.env.ALIPAY_APP_ID || '',
      clientSecret: process.env.ALIPAY_APP_SECRET || '',
      callbackURL: cb,
      scope: 'auth_userinfo',
      state: true,
    }, (accessToken: string, refreshToken: string, profile: unknown, done: (err: Error | null, profile: unknown) => void) => {
      done(null, profile);
    });
    this.callbackURL = cb;
  }

  getAuthorizationUrl(options: Record<string, unknown>) {
    const appId = process.env.ALIPAY_APP_ID || '';
    const redirectUri = encodeURIComponent((options.callbackURL as string) || this.callbackURL);
    const state = (options.state as string) || Math.random().toString(36).substring(7);
    const scope = (options.scope as string) || 'auth_userinfo';
    return `https://openauth.alipay.com/oauth2/publicAppAuthorize.htm?app_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
  }

  async userProfile(accessToken: string): Promise<Record<string, unknown>> {
    try {
      const appId = process.env.ALIPAY_APP_ID || '';
      const mockId = `alipay_${Buffer.from(accessToken).toString('base64').substring(0, 20)}`;
      return {
        provider: 'alipay',
        id: mockId,
        nickname: '支付宝用户',
        avatar: null,
        _raw: { appId, accessToken },
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to fetch Alipay user profile: ${msg}`);
    }
  }

  generateSign(data: string, privateKey: string): string {
    return crypto.createSign('RSA-SHA256').update(data).sign(privateKey, 'base64');
  }
}
