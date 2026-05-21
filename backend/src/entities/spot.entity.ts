import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany, ManyToOne, JoinColumn, Index
} from 'typeorm';
import { SpotFavorite } from './spot-favorite.entity';
import { SpotComment } from './spot-comment.entity';
import { User } from './user.entity';

export enum SpotType {
  RIVER = 'river',
  LAKE = 'lake',
  RESERVOIR = 'reservoir',
  POND = 'pond',
  STREAM = 'stream',
  OCEAN = 'ocean',
  OTHER = 'other',
}

export enum SpotStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

@Entity('spots')
@Index(['status', 'isPublic'])
@Index(['type'])
@Index(['creatorId'])
@Index(['latitude', 'longitude'])
@Index(['province', 'city', 'district'])
export class Spot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200, comment: '钓点名称' })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, comment: '经度' })
  longitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, comment: '纬度' })
  latitude: number;

  @Column({ type: 'enum', enum: SpotType, default: SpotType.RIVER, comment: '钓点类型' })
  type: SpotType;

  @Column({ type: 'varchar', length: 200, nullable: true, comment: '省份' })
  province: string;

  @Column({ type: 'varchar', length: 200, nullable: true, comment: '城市' })
  city: string;

  @Column({ type: 'varchar', length: 200, nullable: true, comment: '区县' })
  district: string;

  @Column({ type: 'text', nullable: true, comment: '地址描述' })
  address: string;

  @Column({ type: 'simple-array', nullable: true, comment: '鱼种' })
  fishSpecies: string[];

  @Column({ name: 'water_depth', type: 'decimal', precision: 5, scale: 2, nullable: true, comment: '水深(米)' })
  depth: number;

  @Column({ name: 'water_temp', type: 'decimal', precision: 4, scale: 1, nullable: true, comment: '水温(℃)' })
  waterTemp: number;

  @Column({ type: 'simple-array', nullable: true, comment: '推荐饵料' })
  baits: string[];

  @Column({ type: 'simple-array', nullable: true, comment: '推荐钓法' })
  fishingMethods: string[];

  @Column({ type: 'simple-json', nullable: true, comment: '照片URLs' })
  photos: string[];

  @Column({ type: 'int', default: 0, comment: '收藏数' })
  favoriteCount: number;

  @Column({ type: 'int', default: 0, comment: '评论数' })
  commentCount: number;

  @Column({ default: true, comment: '是否公开' })
  isPublic: boolean;

  @Column({ type: 'enum', enum: SpotStatus, default: SpotStatus.APPROVED, comment: '审核状态' })
  status: SpotStatus;

  @Column({ type: 'uuid', nullable: true, comment: '审核员ID' })
  reviewerId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewerId' })
  reviewer: User;

  @Column({ type: 'text', nullable: true, comment: '审核备注' })
  reviewNote: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true, comment: '评分' })
  rating: number;

  @Column({ type: 'simple-json', nullable: true, comment: '鱼种类型' })
  fishTypes: string[];

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '最佳季节' })
  seasonalBest: string;

  @Column({ type: 'enum', enum: DifficultyLevel, nullable: true, comment: '难度' })
  difficulty: DifficultyLevel;

  @Column({ type: 'simple-array', nullable: true, comment: '配套设施' })
  facilities: string[];

  @Column({ type: 'simple-array', nullable: true, comment: '注意事项' })
  cautions: string[];

  @Column({ type: 'text', nullable: true, comment: '详细介绍' })
  description: string;

  @Column({ name: 'browse_count', type: 'int', default: 0, comment: '浏览次数' })
  browseCount: number;

  @Column({ name: 'parking_info', type: 'varchar', length: 500, nullable: true, comment: '停车信息' })
  parkingInfo: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '联系电话' })
  phone: string;

  @Column({ name: 'price_range', type: 'varchar', length: 100, nullable: true, comment: '价格区间' })
  priceRange: string;

  @Column({ name: 'price_note', type: 'text', nullable: true, comment: '收费说明' })
  priceNote: string;

  @Column({ name: 'business_hours', type: 'varchar', length: 200, nullable: true, comment: '营业时间' })
  businessHours: string;

  @Column({ name: 'review_count', type: 'int', default: 0, comment: '评价次数' })
  reviewCount: number;

  @Column({ name: 'avg_rating', type: 'decimal', precision: 3, scale: 2, nullable: true, comment: '平均评分' })
  avgRating: number;

  @Column({ name: 'last_fished_at', type: 'timestamp', nullable: true, comment: '最近有人作钓时间' })
  lastFishedAt: Date;

  @Column({ type: 'uuid', nullable: true, comment: '创建者ID' })
  creatorId: string;

  @ManyToOne(() => User, user => user.id, { nullable: true })
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  @OneToMany(() => SpotFavorite, fav => fav.spot)
  favorites: SpotFavorite[];

  @OneToMany(() => SpotComment, comment => comment.spot)
  comments: SpotComment[];
}
