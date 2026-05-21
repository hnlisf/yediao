import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Spot, SpotStatus } from '../../entities/spot.entity';
import { SpotReview, ReviewAction } from '../../entities/spot-review.entity';

@Injectable()
export class SpotAuditService {
  constructor(
    @InjectRepository(Spot)
    private spotRepository: Repository<Spot>,
    @InjectRepository(SpotReview)
    private reviewRepository: Repository<SpotReview>,
  ) {}

  async findPending(page = 1, limit = 20) {
    const [items, total] = await this.spotRepository.findAndCount({
      where: { status: SpotStatus.PENDING },
      relations: ['creator'],
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  async approve(reviewerId: string, spotId: string, note?: string) {
    const spot = await this.spotRepository.findOne({ where: { id: spotId } });
    if (!spot) throw new NotFoundException('钓点不存在');
    if (spot.status !== SpotStatus.PENDING) {
      throw new ForbiddenException('该钓点已审核');
    }

    spot.status = SpotStatus.APPROVED;
    spot.reviewerId = reviewerId;
    spot.reviewNote = note;
    await this.spotRepository.save(spot);

    const review = this.reviewRepository.create({
      spotId,
      reviewerId,
      action: ReviewAction.APPROVE,
      note,
    });
    await this.reviewRepository.save(review);
    return { message: '已通过' };
  }

  async reject(reviewerId: string, spotId: string, note?: string) {
    const spot = await this.spotRepository.findOne({ where: { id: spotId } });
    if (!spot) throw new NotFoundException('钓点不存在');
    if (spot.status !== SpotStatus.PENDING) {
      throw new ForbiddenException('该钓点已审核');
    }

    spot.status = SpotStatus.REJECTED;
    spot.reviewerId = reviewerId;
    spot.reviewNote = note;
    await this.spotRepository.save(spot);

    const review = this.reviewRepository.create({
      spotId,
      reviewerId,
      action: ReviewAction.REJECT,
      note,
    });
    await this.reviewRepository.save(review);
    return { message: '已拒绝' };
  }

  async getReviewHistory(spotId: string, page = 1, limit = 20) {
    const [items, total] = await this.reviewRepository.findAndCount({
      where: { spotId },
      relations: ['reviewer'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  async getStats() {
    const [pending, approved, rejected] = await Promise.all([
      this.spotRepository.count({ where: { status: SpotStatus.PENDING } }),
      this.spotRepository.count({ where: { status: SpotStatus.APPROVED } }),
      this.spotRepository.count({ where: { status: SpotStatus.REJECTED } }),
    ]);
    return { pending, approved, rejected, total: pending + approved + rejected };
  }
}