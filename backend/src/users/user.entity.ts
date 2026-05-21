import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum OAuthProvider {
  WECHAT = 'wechat',
  ALIPAY = 'alipay',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 20 })
  phone: string;

  @Column({ length: 50, nullable: true })
  nickname: string;

  @Column({ nullable: true })
  avatar_url: string;

  @Column({ type: 'int', default: 0 })
  fishing_age: number;

  @Column('text', { array: true, nullable: true })
  frequent_spots: string[];

  @Column('text', { array: true, nullable: true })
  skilled_fish: string[];

  @Column('jsonb', { default: {} })
  privacy_settings: Record<string, any>;

  @Column({ type: 'enum', enum: OAuthProvider, name: 'oauth_provider', nullable: true })
  oauth_provider: OAuthProvider;

  @Column({ type: 'varchar', name: 'oauth_open_id', length: 100, nullable: true })
  oauth_open_id: string;

  @Column({ type: 'varchar', name: 'oauth_union_id', length: 100, nullable: true })
  oauth_union_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
