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

/**
 * Privacy settings stored in DB as JSONB in privacy_settings column.
 * Single toggle per field (no granular public/friends/private per field).
 */
export interface PrivacySettings {
  phone_visible?: boolean;
  location_visible?: boolean;
  // Individual field visibility flags (mapped from show* boolean columns)
  show_fishing_age?: boolean;
  show_frequent_spot?: boolean;
  show_skilled_fish?: boolean;
  show_posts?: boolean;
  show_friends?: boolean;
  allow_push?: boolean;
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true, length: 20, comment: '手机号' })
  @Index()
  phone: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '昵称' })
  nickname: string;

  @Column({ type: 'text', name: 'avatar_url', nullable: true, comment: '头像URL' })
  avatar: string;

  @Column({ type: 'int', name: 'fishing_age', default: 0, comment: '钓龄(年)' })
  fishingAge: number;

  @Column({ type: 'simple-array', name: 'frequent_spot', nullable: true, comment: '常驻扎钓点' })
  frequentSpot: string[];

  @Column({ type: 'simple-array', name: 'skilled_fish', nullable: true, comment: '擅长鱼种' })
  skilledFish: string[];

  /** Stored as JSONB in privacy_settings column */
  @Column({ type: 'jsonb', name: 'privacy_settings', default: '{}' })
  privacySettings: PrivacySettings;

  @Column({ type: 'varchar', name: 'oauth_provider', length: 20, nullable: true, comment: 'OAuth提供商' })
  oauthProvider: OAuthProvider;

  @Column({ type: 'varchar', name: 'oauth_open_id', length: 100, nullable: true, comment: 'OAuth openid' })
  oauthOpenId: string;

  @Column({ type: 'varchar', name: 'oauth_union_id', length: 100, nullable: true, comment: 'OAuth unionid' })
  oauthUnionId: string;

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;

  // ===== Relations (no DB columns, just ORM mappings) =====
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

  // ===== Virtual accessors (not persisted — computed from privacySettings) =====
  // TypeORM reads these from the entity after loading; they are not DB columns.
  // Used by services to access privacy preferences without manually unpacking JSONB.
  get showFishingAge(): boolean {
    return this.privacySettings?.show_fishing_age ?? true;
  }
  set showFishingAge(v: boolean) {
    this.privacySettings = { ...this.privacySettings, show_fishing_age: v };
  }

  get showFrequentSpot(): boolean {
    return this.privacySettings?.show_frequent_spot ?? true;
  }
  set showFrequentSpot(v: boolean) {
    this.privacySettings = { ...this.privacySettings, show_frequent_spot: v };
  }

  get showSkilledFish(): boolean {
    return this.privacySettings?.show_skilled_fish ?? true;
  }
  set showSkilledFish(v: boolean) {
    this.privacySettings = { ...this.privacySettings, show_skilled_fish: v };
  }

  get allowPush(): boolean {
    return this.privacySettings?.allow_push ?? true;
  }
  set allowPush(v: boolean) {
    this.privacySettings = { ...this.privacySettings, allow_push: v };
  }

  get showPosts(): boolean {
    return this.privacySettings?.show_posts ?? true;
  }
  set showPosts(v: boolean) {
    this.privacySettings = { ...this.privacySettings, show_posts: v };
  }

  get showFriends(): boolean {
    return this.privacySettings?.show_friends ?? true;
  }
  set showFriends(v: boolean) {
    this.privacySettings = { ...this.privacySettings, show_friends: v };
  }
}
