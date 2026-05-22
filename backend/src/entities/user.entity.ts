import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany, Index
} from 'typeorm';
import { SpotFavorite } from './spot-favorite.entity';
import { SpotComment } from './spot-comment.entity';
import { Post } from './post.entity';
import { PostLike } from './post-like.entity';
import { PostComment } from './post-comment.entity';
import { FishingDate } from './fishing-date.entity';
import { FishingDateParticipant } from './fishing-date-participant.entity';
import { AiRecognition } from './ai-recognition.entity';
import { PointRecord } from './point-record.entity';

export enum OAuthProvider {
  WECHAT = 'wechat',
  ALIPAY = 'alipay',
}

export enum PrivacyLevel {
  PUBLIC = 'public',       // 公开 - 所有用户可见
  FRIENDS = 'friends',     // 好友可见
  PRIVATE = 'private',     // 仅自己可见
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true, length: 20, comment: '手机号' })
  @Index()
  phone: string;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '昵称' })
  nickname: string;

  @Column({ type: 'varchar', name: 'avatar_url', length: 500, nullable: true, comment: '头像URL' })
  avatar: string;

  @Column({ type: 'int', name: 'fishing_age', default: 0, comment: '钓龄(年)' })
  fishingAge: number;

  @Column({ type: 'simple-array', name: 'frequent_spot', nullable: true, comment: '常驻扎钓点' })
  frequentSpot: string[];

  @Column({ type: 'simple-array', name: 'skilled_fish', nullable: true, comment: '擅长鱼种' })
  skilledFish: string[];

  @Column({ default: true, comment: '是否公开钓龄' })
  showFishingAge: boolean;

  @Column({ default: true, comment: '是否公开常驻扎钓点' })
  showFrequentSpot: boolean;

  @Column({ default: true, comment: '是否公开擅长鱼种' })
  showSkilledFish: boolean;

  @Column({ default: true, comment: '是否接收推送' })
  allowPush: boolean;

  @Column({ name: 'show_posts', default: true, comment: '是否公开动态' })
  showPosts: boolean;

  @Column({ name: 'show_friends', default: true, comment: '是否公开渔友' })
  showFriends: boolean;

  @Column({ type: 'int', name: 'points_balance', default: 0, comment: '积分余额' })
  pointsBalance: number;

  @Column({ type: 'enum', enum: OAuthProvider, name: 'oauth_provider', nullable: true, comment: 'OAuth提供商' })
  oauthProvider: OAuthProvider;

  @Column({ type: 'varchar', name: 'oauth_open_id', length: 100, nullable: true, comment: 'OAuth openid' })
  oauthOpenId: string;

  @Column({ type: 'varchar', name: 'oauth_union_id', length: 100, nullable: true, comment: 'OAuth unionid' })
  oauthUnionId: string;

  @Column({
    type: 'enum',
    enum: PrivacyLevel,
    default: PrivacyLevel.PUBLIC,
    comment: '隐私级别',
  })
  privacyLevel: PrivacyLevel;

  @Column({ type: 'varchar', name: 'personal_signature', length: 200, nullable: true, comment: '个性签名' })
  personalSignature: string;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  @OneToMany(() => SpotFavorite, favorite => favorite.user)
  spotFavorites: SpotFavorite[];

  @OneToMany(() => SpotComment, comment => comment.user)
  spotComments: SpotComment[];

  @OneToMany(() => Post, post => post.user)
  posts: Post[];

  @OneToMany(() => PostLike, like => like.user)
  postLikes: PostLike[];

  @OneToMany(() => PostComment, comment => comment.user)
  postComments: PostComment[];

  @OneToMany(() => FishingDate, fd => fd.creator)
  createdFishingDates: FishingDate[];

  @OneToMany(() => FishingDateParticipant, fdp => fdp.user)
  fishingDateParticipants: FishingDateParticipant[];

  @OneToMany(() => AiRecognition, rec => rec.user)
  aiRecognitions: AiRecognition[];

  @OneToMany(() => PointRecord, pr => pr.user)
  pointRecords: PointRecord[];
}
