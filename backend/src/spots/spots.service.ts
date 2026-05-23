import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Spot } from './spot.entity';

@Injectable()
export class SpotsService {
  constructor(
    @InjectRepository(Spot)
    private spotRepo: Repository<Spot>,
  ) {}

  async findAll(lat?: number, lng?: number, radius?: number) {
    const spots = await this.spotRepo.find();
    return spots.map((s) => ({ ...s, photos: s.photos || [] }));
  }

  async findOne(id: number) {
    const spot = await this.spotRepo.findOne({ where: { id } });
    if (!spot) throw new NotFoundException('钓位不存在');
    return spot;
  }

  async create(dto: any, userId: number) {
    const spot = this.spotRepo.create({ ...dto, creator_id: userId });
    return this.spotRepo.save(spot);
  }

  async favorite(spotId: number, userId: number) {
    return { message: '收藏成功', spotId, userId };
  }

  async unfavorite(spotId: number, userId: number) {
    return { message: '取消收藏成功', spotId, userId };
  }

  async getReviews(spotId: number) {
    return [];
  }

  async addReview(spotId: number, userId: number, dto: any) {
    return { message: '评论成功', spotId, userId, ...dto };
  }
}
