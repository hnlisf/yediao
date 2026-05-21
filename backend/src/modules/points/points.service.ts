import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import { PointRecord, PointAction } from '../../entities/point-record.entity';
import { User } from '../../entities/user.entity';
import { EarnPointsDto, SpendPointsDto, PointRecordQueryDto } from './dto/points.dto';

// Points configuration
const POINTS_CONFIG: Record<string, { earn: number; spend: number }> = {
  [PointAction.REGISTER]: { earn: 50, spend: 0 },
  [PointAction.LOGIN]: { earn: 5, spend: 0 },
  [PointAction.POST_CREATED]: { earn: 10, spend: 0 },
  [PointAction.POST_LIKED]: { earn: 2, spend: 0 },
  [PointAction.COMMENT_CREATED]: { earn: 3, spend: 0 },
  [PointAction.SPOT_UPLOADED]: { earn: 20, spend: 0 },
  [PointAction.SPOT_APPROVED]: { earn: 30, spend: 0 },
  [PointAction.RECOGNITION]: { earn: 5, spend: 0 },
  [PointAction.PROTECTED_RELEASE]: { earn: 15, spend: 0 },
  [PointAction.PROTECTED_REPORT]: { earn: 10, spend: 0 },
  [PointAction.GATHERING_JOIN]: { earn: 5, spend: 0 },
  [PointAction.DAILY_CHECKIN]: { earn: 3, spend: 0 },
};

// Daily check-in grace period: 5 minutes
const CHECKIN_GRACE_MS = 5 * 60 * 1000;

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(PointRecord)
    private pointRecordRepo: Repository<PointRecord>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private dataSource: DataSource,
  ) {}

  /**
   * Earn points for a user with idempotency support
   */
  async earnPoints(userId: string, dto: EarnPointsDto): Promise<{ balance: number; earned: number }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');

    const points = dto.points ?? POINTS_CONFIG[dto.action]?.earn ?? 0;
    const description = dto.description || `积分奖励: ${dto.action}`;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.increment(User, { id: userId }, 'pointsBalance', points);
      const record = this.pointRecordRepo.create({
        userId,
        action: dto.action as PointAction,
        points,
        description,
        refId: dto.refId,
      });
      await queryRunner.manager.save(record);
      await queryRunner.commitTransaction();

      return { balance: user.pointsBalance + points, earned: points };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Daily check-in with once-per-day guarantee
   */
  async dailyCheckin(userId: string): Promise<{ balance: number; earned: number; consecutiveDays: number; alreadyCheckedIn: boolean }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if already checked in today (within grace period)
    const existingRecord = await this.pointRecordRepo.findOne({
      where: {
        userId,
        action: PointAction.DAILY_CHECKIN,
        createdAt: Between(new Date(today.getTime() - CHECKIN_GRACE_MS), new Date(tomorrow.getTime() - 1)),
      },
      order: { createdAt: 'DESC' },
    });

    if (existingRecord) {
      return {
        balance: user.pointsBalance,
        earned: 0,
        consecutiveDays: 0,
        alreadyCheckedIn: true,
      };
    }

    // Count consecutive check-in days
    let consecutiveDays = 1;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayRecord = await this.pointRecordRepo.findOne({
      where: {
        userId,
        action: PointAction.DAILY_CHECKIN,
        createdAt: Between(new Date(yesterday.getTime() - CHECKIN_GRACE_MS), new Date(yesterday.getTime() + 86400000 - 1)),
      },
    });

    if (yesterdayRecord) {
      consecutiveDays = 2;
    }

    const points = POINTS_CONFIG[PointAction.DAILY_CHECKIN].earn;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.increment(User, { id: userId }, 'pointsBalance', points);
      const record = this.pointRecordRepo.create({
        userId,
        action: PointAction.DAILY_CHECKIN,
        points,
        description: `每日签到奖励 (第${consecutiveDays}天)`,
      });
      await queryRunner.manager.save(record);
      await queryRunner.commitTransaction();

      return { balance: user.pointsBalance + points, earned: points, consecutiveDays, alreadyCheckedIn: false };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Award points for specific actions (called by other services)
   */
  async awardPointsForAction(userId: string, action: PointAction, refId?: string): Promise<{ balance: number; earned: number }> {
    return this.earnPoints(userId, { action, refId });
  }

  /**
   * Spend points for a user
   */
  async spendPoints(userId: string, dto: SpendPointsDto): Promise<{ balance: number; spent: number }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');

    const points = dto.points ?? POINTS_CONFIG[dto.action]?.spend ?? 0;
    if (user.pointsBalance < points) {
      throw new BadRequestException('积分余额不足');
    }

    const description = dto.description || `积分消耗: ${dto.action}`;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.decrement(User, { id: userId }, 'pointsBalance', points);
      const record = this.pointRecordRepo.create({
        userId,
        action: dto.action as PointAction,
        points: -points,
        description,
        refId: dto.refId,
      });
      await queryRunner.manager.save(record);
      await queryRunner.commitTransaction();

      return { balance: user.pointsBalance - points, spent: points };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get user's point records with pagination
   */
  async getPointRecords(userId: string, query: PointRecordQueryDto) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [records, total] = await this.pointRecordRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      records,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get user's current point balance
   */
  async getBalance(userId: string): Promise<{ balance: number }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');
    return { balance: user.pointsBalance };
  }

  /**
   * Get points config for a specific action (for clients to know values)
   */
  getPointsConfig(): typeof POINTS_CONFIG {
    return POINTS_CONFIG;
  }
}
