import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, OAuthProvider, PrivacyLevel } from '../../entities/user.entity';
import { PointAction } from '../../entities/point-record.entity';
import { LoginDto, RegisterDto, SendCodeDto, OAuthLoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  // Simulated code store (use Redis in production)
  private codeStore: Map<string, { code: string; expireAt: number }> = new Map();

  async sendCode(dto: SendCodeDto) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.codeStore.set(dto.phone, { code, expireAt: Date.now() + 5 * 60 * 1000 });
    // TODO: Integrate SMS provider
    console.log(`验证码已发送: ${dto.phone} -> ${code}`);
    return { message: '验证码已发送', debugCode: code };
  }

  async register(dto: RegisterDto) {
    const record = this.codeStore.get(dto.phone);
    if (!record || record.code !== dto.code || record.expireAt < Date.now()) {
      throw new BadRequestException('验证码无效或已过期');
    }

    const existing = await this.userRepository.findOne({ where: { phone: dto.phone } });
    if (existing) {
      throw new BadRequestException('手机号已注册');
    }

    const user = this.userRepository.create({
      phone: dto.phone,
      privacyLevel: PrivacyLevel.PUBLIC,
      showFishingAge: true,
      showFrequentSpot: true,
      showSkilledFish: true,
      showPosts: true,
      showFriends: true,
      allowPush: true,
      pointsBalance: 0,
      skilledFish: [],
    });
    await this.userRepository.save(user);
    this.codeStore.delete(dto.phone);

    const token = this.jwtService.sign({ sub: user.id, phone: user.phone });
    return { token, user: { id: user.id, phone: user.phone } };
  }

  async login(dto: LoginDto) {
    const record = this.codeStore.get(dto.phone);
    if (!record || record.code !== dto.code || record.expireAt < Date.now()) {
      throw new BadRequestException('验证码无效或已过期');
    }

    const user = await this.userRepository.findOne({ where: { phone: dto.phone } });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    this.codeStore.delete(dto.phone);
    const token = this.jwtService.sign({ sub: user.id, phone: user.phone });
    return { token, user: { id: user.id, phone: user.phone, nickname: user.nickname, avatar: user.avatar } };
  }

  async validateUser(userId: string) {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  /**
   * Generate JWT token for a user (used by OAuth)
   */
  generateToken(user: User): string {
    return this.jwtService.sign({ sub: user.id, phone: user.phone });
  }

  async oauthLogin(dto: OAuthLoginDto) {
    const { provider, openId, unionId, nickname, avatar } = dto;

    let user = await this.userRepository.findOne({
      where: { oauthProvider: provider, oauthOpenId: openId },
    });

    if (!user && unionId) {
      user = await this.userRepository.findOne({
        where: { oauthProvider: provider, oauthUnionId: unionId },
      });
    }

    if (!user) {
      user = this.userRepository.create({
        oauthProvider: provider,
        oauthOpenId: openId,
        oauthUnionId: unionId,
        nickname: nickname || `${provider}用户`,
        avatar: avatar,
        phone: `oauth_${openId.substring(0, 20)}`,
        privacyLevel: PrivacyLevel.PUBLIC,
        showFishingAge: true,
        showFrequentSpot: true,
        showSkilledFish: true,
        showPosts: true,
        showFriends: true,
        allowPush: true,
        pointsBalance: 0,
        skilledFish: [],
      });
      await this.userRepository.save(user);
    } else {
      if (nickname || avatar) {
        Object.assign(user, { nickname: nickname || user.nickname, avatar: avatar || user.avatar });
        await this.userRepository.save(user);
      }
    }

    const token = this.jwtService.sign({ sub: user.id, phone: user.phone });
    return { token, user: { id: user.id, phone: user.phone, nickname: user.nickname, avatar: user.avatar } };
  }
}
