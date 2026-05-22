import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  // 模拟发送验证码 (MVP阶段直接返回)
  async sendCode(phone: string) {
    const code = '123456'; // MVP固定验证码
    return { message: '验证码已发送', code };
  }

  async login(phone: string, code: string) {
    if (code !== '123456') {
      throw new UnauthorizedException('验证码错误');
    }

    let user = await this.userRepo.findOne({ where: { phone } });
    if (!user) {
      user = this.userRepo.create({ phone });
      await this.userRepo.save(user);
    }

    const token = this.jwtService.sign({ userId: user.id, phone: user.phone });
    return { token, user };
  }

  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: +userId } });
    if (!user) throw new UnauthorizedException('用户不存在');
    return user;
  }

  async updateProfile(userId: string, dto: any) {
    await this.userRepo.update(+userId, dto);
    return this.getProfile(userId);
  }

  generateToken(user: User): string {
    return this.jwtService.sign({ userId: user.id, phone: user.phone });
  }
}
