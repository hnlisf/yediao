import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, PrivacyLevel } from '../../entities/user.entity';
import { PointRecord, PointAction } from '../../entities/point-record.entity';
import { UpdateProfileDto, PrivacySettingsDto, BindPhoneDto, ProfileCompletenessDto } from './dto/user.dto';
import { PointsService } from '../points/points.service';

// Profile completeness scoring config
const PROFILE_COMPLETENESS_CONFIG = {
  nickname: { maxPoints: 10 },
  avatar: { maxPoints: 10 },
  phone: { maxPoints: 15 },
  fishingAge: { maxPoints: 15 },
  frequentSpot: { maxPoints: 15 },
  skilledFish: { maxPoints: 20 },
  personalSignature: { maxPoints: 15 },
};

@Injectable()
export class UserService {
  private codeStore: Map<string, { code: string; expireAt: number }> = new Map();

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PointRecord)
    private pointRecordRepository: Repository<PointRecord>,
    private pointsService: PointsService,
  ) {}

  async findById(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('用户不存在');
    return this.sanitizeUser(user);
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    await this.userRepository.update(id, dto);
    return this.findById(id);
  }

  async updatePrivacy(id: string, dto: PrivacySettingsDto | any) {
    await this.userRepository.update(id, dto);
    return { message: '隐私设置已更新' };
  }

  private sanitizeUser(user: User) {
    const { ...rest } = user;
    return rest;
  }

  /**
   * Get profile completeness score with detailed breakdown
   */
  async getProfileCompleteness(userId: string): Promise<ProfileCompletenessDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');

    const breakdown = {
      nickname: {
        filled: !!(user.nickname && user.nickname.trim().length > 0),
        points: 0,
        maxPoints: PROFILE_COMPLETENESS_CONFIG.nickname.maxPoints,
      },
      avatar: {
        filled: !!(user.avatar && user.avatar.trim().length > 0),
        points: 0,
        maxPoints: PROFILE_COMPLETENESS_CONFIG.avatar.maxPoints,
      },
      phone: {
        filled: !!(user.phone && !user.phone.startsWith('oauth_')),
        points: 0,
        maxPoints: PROFILE_COMPLETENESS_CONFIG.phone.maxPoints,
      },
      fishingAge: {
        filled: user.fishingAge > 0,
        points: 0,
        maxPoints: PROFILE_COMPLETENESS_CONFIG.fishingAge.maxPoints,
      },
      frequentSpot: {
        filled: !!(user.frequentSpot && user.frequentSpot.length > 0),
        points: 0,
        maxPoints: PROFILE_COMPLETENESS_CONFIG.frequentSpot.maxPoints,
      },
      skilledFish: {
        filled: !!(user.skilledFish && user.skilledFish.length > 0),
        points: 0,
        maxPoints: PROFILE_COMPLETENESS_CONFIG.skilledFish.maxPoints,
      },
      personalSignature: {
        filled: !!(user.personalSignature && user.personalSignature.trim().length > 0),
        points: 0,
        maxPoints: PROFILE_COMPLETENESS_CONFIG.personalSignature.maxPoints,
      },
    };

    // Calculate points
    let total = 0;
    const suggestions: string[] = [];

    for (const [key, config] of Object.entries(PROFILE_COMPLETENESS_CONFIG)) {
      const field = breakdown[key as keyof typeof breakdown];
      if (field.filled) {
        field.points = config.maxPoints;
        total += config.maxPoints;
      } else {
        const labels: Record<string, string> = {
          nickname: '完善昵称',
          avatar: '上传头像',
          phone: '绑定手机号',
          fishingAge: '填写钓龄',
          frequentSpot: '填写常驻扎钓点',
          skilledFish: '填写擅长鱼种',
          personalSignature: '填写个性签名',
        };
        suggestions.push(labels[key]);
      }
    }

    return { total, breakdown, suggestions };
  }

  /**
   * Bind phone number for OAuth users
   */
  async bindPhone(userId: string, dto: BindPhoneDto): Promise<{ user: any; token: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');

    // Check if phone is already bound to another user
    const existing = await this.userRepository.findOne({ where: { phone: dto.phone } });
    if (existing && existing.id !== userId) {
      throw new BadRequestException('该手机号已绑定其他账号');
    }

    // Verify SMS code
    const record = this.codeStore.get(dto.phone);
    if (!record || record.code !== dto.code || record.expireAt < Date.now()) {
      throw new BadRequestException('验证码无效或已过期');
    }
    this.codeStore.delete(dto.phone);

    // Update phone
    user.phone = dto.phone;
    await this.userRepository.save(user);

    // Generate new token
    const { JwtService } = require('@nestjs/jwt');
    const jwtService = new JwtService({});
    const token = jwtService.sign({ sub: user.id, phone: user.phone });

    return { user: this.sanitizeUser(user), token };
  }

  /**
   * Send verification code for phone binding
   */
  async sendBindCode(phone: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.codeStore.set(phone, { code, expireAt: Date.now() + 5 * 60 * 1000 });
    // TODO: Integrate SMS provider
    console.log(`绑定验证码已发送: ${phone} -> ${code}`);
    return { message: '验证码已发送', debugCode: code };
  }

  async addPoints(userId: string, action: PointAction, points: number, description: string, refId?: string): Promise<{ totalPoints: number }> {
    const record = this.pointRecordRepository.create({ userId, action, points, description, refId });
    await this.pointRecordRepository.save(record);
    await this.userRepository.increment({ id: userId }, 'pointsBalance', points);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    return { totalPoints: user.pointsBalance };
  }

  async getPointsHistory(userId: string, page = 1, limit = 20) {
    const [items, total] = await this.pointRecordRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  async getPublicProfile(userId: string, requesterId?: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');

    const isOwner = userId === requesterId;

    // Privacy level check
    if (user.privacyLevel === PrivacyLevel.PRIVATE && !isOwner) {
      const { phone, oauthOpenId, oauthUnionId, personalSignature, pointsBalance, ...publicFields } = user;
      return {
        ...publicFields,
        nickname: user.nickname || '匿名用户',
        phone: null,
        oauthOpenId: null,
        oauthUnionId: null,
        personalSignature: null,
        pointsBalance: null,
        showPosts: false,
        showFriends: false,
      };
    }

    // Apply individual privacy settings
    const profile: any = { ...user };

    if (!isOwner) {
      if (!user.showFishingAge) profile.fishingAge = null;
      if (!user.showFrequentSpot) profile.frequentSpot = null;
      if (!user.showSkilledFish) profile.skilledFish = [];
      if (!user.showPosts) profile.posts = null;
      if (!user.showFriends) profile.fishingDateParticipants = null;
    }

    // Always hide sensitive data from non-owners
    if (!isOwner) {
      profile.oauthOpenId = null;
      profile.oauthUnionId = null;
      profile.phone = null;
    }

    return profile;
  }
}
