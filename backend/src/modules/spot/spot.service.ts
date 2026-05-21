import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Spot, SpotType, SpotStatus, DifficultyLevel } from '../../entities/spot.entity';
import { SpotFavorite } from '../../entities/spot-favorite.entity';
import { SpotComment, CommentStatus } from '../../entities/spot-comment.entity';
import { SpotReview, ReviewAction } from '../../entities/spot-review.entity';
import {
  CreateSpotDto, NearbyQueryDto, CommentDto, SpotFilterDto,
  ReviewSpotDto, UpdateSpotDto,
} from './dto/spot.dto';

const CDN_PREFIX = 'https://yediao-app.oss-cn-hangzhou.aliyuncs.com';

@Injectable()
export class SpotService {
  constructor(
    @InjectRepository(Spot)
    private spotRepository: Repository<Spot>,
    @InjectRepository(SpotFavorite)
    private favoriteRepository: Repository<SpotFavorite>,
    @InjectRepository(SpotComment)
    private commentRepository: Repository<SpotComment>,
    @InjectRepository(SpotReview)
    private reviewRepository: Repository<SpotReview>,
    private dataSource: DataSource,
  ) {}

  // ---- LBS附近查询 ----
  async findNearby(lat: number, lng: number, radiusMeters: number = 5000, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const itemsQuery = `
      SELECT *,
        (6371000 * acos(
          least(1, cos(radians($1)) * cos(radians(latitude::float)) * cos(radians(longitude::float) - radians($2)) +
          sin(radians($1)) * sin(radians(latitude::float))
        )) AS distance
      FROM spots
      WHERE is_public = true AND status = 'approved'
        AND latitude IS NOT NULL AND longitude IS NOT NULL
        AND (6371000 * acos(
          cos(radians($1)) * cos(radians(latitude::float)) * cos(radians(longitude::float) - radians($2)) +
          sin(radians($1)) * sin(radians(latitude::float))
        )) < $3
      ORDER BY distance
      LIMIT $4 OFFSET $5
    `;

    const countQuery = `
      SELECT COUNT(*) as total FROM (
        SELECT id, (6371000 * acos(
          cos(radians($1)) * cos(radians(latitude::float)) * cos(radians(longitude::float) - radians($2)) +
          sin(radians($1)) * sin(radians(latitude::float))
        )) AS distance
        FROM spots
        WHERE is_public = true AND status = 'approved'
          AND latitude IS NOT NULL AND longitude IS NOT NULL
      ) subq WHERE distance < $3
    `;

    const [items, countResult] = await Promise.all([
      this.dataSource.query(itemsQuery, [lat, lng, radiusMeters, limit, offset]),
      this.dataSource.query(countQuery, [lat, lng, radiusMeters]),
    ]);

    const total = parseInt(countResult[0]?.total || '0', 10);
    return { items: items.map(i => this.mapSpotPhoto(i)), total, page, limit };
  }

  // ---- 过滤查询 ----
  async findFiltered(filter: SpotFilterDto, page = 1, limit = 20) {
    const qb = this.spotRepository.createQueryBuilder('spot')
      .where('spot.isPublic = true')
      .andWhere('spot.status = :status', { status: SpotStatus.APPROVED });

    if (filter.province) qb.andWhere('spot.province = :province', { province: filter.province });
    if (filter.city) qb.andWhere('spot.city = :city', { city: filter.city });
    if (filter.district) qb.andWhere('spot.district = :district', { district: filter.district });
    if (filter.type) qb.andWhere('spot.type = :type', { type: filter.type });
    if (filter.difficulty) qb.andWhere('spot.difficulty = :difficulty', { difficulty: filter.difficulty });
    if (filter.fishSpecies) qb.andWhere("(:species = ANY(string_to_array(spot.fish_species, ',')))", { species: filter.fishSpecies });

    const sortBy = filter.sortBy || 'createdAt';
    const sortOrder = filter.sortOrder || 'DESC';
    qb.orderBy(`spot.${sortBy}`, sortOrder);
    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items: items.map(i => this.mapSpotPhoto(i)), total, page, limit };
  }

  async findById(id: string, userId?: string) {
    const spot = await this.spotRepository.findOne({
      where: { id },
      relations: ['creator', 'reviewer'],
    });
    if (!spot) throw new NotFoundException('钓点不存在');

    // 浏览计数
    await this.spotRepository.increment({ id }, 'browseCount', 1);

    const isFavorited = userId
      ? !!(await this.favoriteRepository.findOne({ where: { spotId: id, userId } }))
      : false;
    const isOwner = userId ? spot.creatorId === userId : false;
    const photoUrls = (spot.photos || []).map(p =>
      p.startsWith('http') ? p : `${CDN_PREFIX}/${p}`,
    );
    return { ...spot, photos: photoUrls, isFavorited, isOwner };
  }

  async create(userId: string, dto: CreateSpotDto) {
    const spot = this.spotRepository.create({
      ...dto,
      creatorId: userId,
      status: SpotStatus.APPROVED,
    });
    return this.spotRepository.save(spot);
  }

  async createForReview(userId: string, dto: CreateSpotDto) {
    const spot = this.spotRepository.create({
      ...dto,
      creatorId: userId,
      status: SpotStatus.PENDING,
    });
    return this.spotRepository.save(spot);
  }

  async updateSpot(userId: string, id: string, dto: UpdateSpotDto) {
    const spot = await this.spotRepository.findOne({ where: { id } });
    if (!spot) throw new NotFoundException('钓点不存在');
    if (spot.creatorId !== userId) throw new ForbiddenException('无权修改');

    Object.assign(spot, dto);
    return this.spotRepository.save(spot);
  }

  // ---- 收藏 ----
  async toggleFavorite(userId: string, spotId: string) {
    const existing = await this.favoriteRepository.findOne({ where: { spotId, userId } });
    if (existing) {
      await this.favoriteRepository.remove(existing);
      await this.spotRepository.decrement({ id: spotId }, 'favoriteCount', 1);
      return { favorited: false };
    }
    const fav = this.favoriteRepository.create({ userId, spotId });
    await this.favoriteRepository.save(fav);
    await this.spotRepository.increment({ id: spotId }, 'favoriteCount', 1);
    return { favorited: true };
  }

  // ---- 评论 ----
  async addComment(userId: string, spotId: string, dto: CommentDto) {
    const spot = await this.spotRepository.findOne({ where: { id: spotId } });
    if (!spot) throw new NotFoundException('钓点不存在');

    const comment = this.commentRepository.create({
      userId,
      spotId,
      content: dto.content,
      parentId: dto.parentId || null,
      status: CommentStatus.APPROVED,
    });
    await this.commentRepository.save(comment);

    // 更新计数
    if (dto.parentId) {
      // 回复：更新父评论回复数
      await this.commentRepository.increment({ id: dto.parentId }, 'replyCount', 1);
    }
    await this.spotRepository.increment({ id: spotId }, 'commentCount', 1);

    return this.commentRepository.findOne({
      where: { id: comment.id },
      relations: ['user'],
    });
  }

  async getComments(spotId: string, page = 1, limit = 20) {
    // 只查顶级评论(parentId=null)，回复通过单独接口获取
    const [items, total] = await this.commentRepository.findAndCount({
      where: { spotId, parentId: null, status: CommentStatus.APPROVED },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  async getReplies(commentId: string, page = 1, limit = 20) {
    const [items, total] = await this.commentRepository.findAndCount({
      where: { parentId: commentId, status: CommentStatus.APPROVED },
      relations: ['user'],
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  // ---- 搜索 ----
  async search(keyword: string, page = 1, limit = 20) {
    const qb = this.spotRepository.createQueryBuilder('spot')
      .where('(spot.name ILIKE :kw OR spot.address ILIKE :kw)', { kw: `%${keyword}%` })
      .andWhere('spot.isPublic = true')
      .andWhere('spot.status = :status', { status: SpotStatus.APPROVED })
      .orderBy('spot.favoriteCount', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items: items.map(i => this.mapSpotPhoto(i)), total, page, limit };
  }

  // ---- 我的收藏 ----
  async getUserFavorites(userId: string, page = 1, limit = 20) {
    const [items, total] = await this.favoriteRepository.findAndCount({
      where: { userId },
      relations: ['spot', 'spot.creator'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    const spots = items
      .map(fav => fav.spot)
      .filter(Boolean)
      .map(s => ({ ...this.mapSpotPhoto(s), isFavorited: true }));
    return { items: spots, total, page, limit };
  }

  // ---- 评分 ----
  async rateSpot(userId: string, spotId: string, rating: number) {
    const spot = await this.spotRepository.findOne({ where: { id: spotId } });
    if (!spot) throw new NotFoundException('钓点不存在');

    const count = spot.reviewCount || 0;
    const currentAvg = spot.avgRating || 0;
    const newAvg = ((currentAvg * count) + rating) / (count + 1);
    spot.avgRating = Math.round(newAvg * 100) / 100;
    spot.reviewCount = count + 1;
    await this.spotRepository.save(spot);
    return { avgRating: spot.avgRating, reviewCount: spot.reviewCount };
  }

  // =====================
  // UGC审核 - 管理员接口
  // =====================

  // 待审核钓点列表
  async getPendingSpots(page = 1, limit = 20) {
    const [items, total] = await this.spotRepository.findAndCount({
      where: { status: SpotStatus.PENDING },
      relations: ['creator'],
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  // 审核钓点
  async reviewSpot(adminId: string, spotId: string, dto: ReviewSpotDto) {
    const spot = await this.spotRepository.findOne({ where: { id: spotId } });
    if (!spot) throw new NotFoundException('钓点不存在');
    if (spot.status !== SpotStatus.PENDING) {
      throw new ForbiddenException('该钓点已审核');
    }

    const action = dto.action === 'approve' ? ReviewAction.APPROVE : ReviewAction.REJECT;
    spot.status = action === ReviewAction.APPROVE ? SpotStatus.APPROVED : SpotStatus.REJECTED;
    spot.reviewerId = adminId;
    spot.reviewNote = dto.note || null;
    await this.spotRepository.save(spot);

    // 记录审核历史
    const review = this.reviewRepository.create({
      spotId,
      reviewerId: adminId,
      action,
      note: dto.note,
    });
    await this.reviewRepository.save(review);

    return spot;
  }

  // 批量审核
  async batchReviewSpots(adminId: string, spotIds: string[], action: string) {
    const reviewAction = action === 'approve' ? ReviewAction.APPROVE : ReviewAction.REJECT;
    const spotStatus = reviewAction === ReviewAction.APPROVE ? SpotStatus.APPROVED : SpotStatus.REJECTED;

    await this.spotRepository.update(
      { id: In(spotIds), status: SpotStatus.PENDING },
      { status: spotStatus, reviewerId: adminId },
    );

    const reviews = spotIds.map(spotId =>
      this.reviewRepository.create({ spotId, reviewerId: adminId, action: reviewAction }),
    );
    await this.reviewRepository.save(reviews);

    return { updated: spotIds.length };
  }

  // 待审核评论列表
  async getPendingComments(page = 1, limit = 20) {
    const [items, total] = await this.commentRepository.findAndCount({
      where: { status: CommentStatus.PENDING },
      relations: ['user', 'spot'],
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  // 审核评论
  async reviewComment(adminId: string, commentId: string, action: string) {
    const comment = await this.commentRepository.findOne({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('评论不存在');

    comment.status = action === 'approve' ? CommentStatus.APPROVED : CommentStatus.REJECTED;
    await this.commentRepository.save(comment);

    // 审核通过后更新钓点评分（仅顶级评论计入）
    if (action === 'approve' && !comment.parentId) {
      await this.spotRepository.increment({ id: comment.spotId }, 'commentCount', 1);
    } else if (action === 'approve' && comment.parentId) {
      await this.commentRepository.increment({ id: comment.parentId }, 'replyCount', 1);
    }

    return comment;
  }

  // ---- 工具方法 ----
  private mapSpotPhoto(spot: any) {
    if (!spot) return spot;
    const photoUrls = (spot.photos || []).map((p: string) =>
      p.startsWith('http') ? p : `${CDN_PREFIX}/${p}`,
    );
    return { ...spot, photos: photoUrls };
  }
}
