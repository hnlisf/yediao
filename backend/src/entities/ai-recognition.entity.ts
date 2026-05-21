import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn
} from 'typeorm';
import { User } from './user.entity';

export enum ProtectionLevel {
  NONE = 'none',
  LEVEL_1 = 'level_1',
  LEVEL_2 = 'level_2',
  LEVEL_3 = 'level_3',
}

@Entity('ai_recognitions')
export class AiRecognition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', comment: '用户ID' })
  userId: string;

  @ManyToOne(() => User, user => user.aiRecognitions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid', nullable: true, comment: '鱼类物种ID' })
  fishSpeciesId: string;

  @Column({ type: 'varchar', length: 500, comment: '图片URL' })
  imageUrl: string;

  @Column({ type: 'varchar', length: 100, comment: '识别鱼名' })
  fishName: string;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '学名' })
  scientificName: string;

  @Column({ type: 'text', nullable: true, comment: '习性描述' })
  habits: string;

  @Column({ type: 'enum', enum: ProtectionLevel, default: ProtectionLevel.NONE, comment: '保护级别' })
  protectionLevel: ProtectionLevel;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0, comment: '置信度' })
  confidence: number;

  @Column({ type: 'jsonb', nullable: true, comment: '完整物种详情' })
  fullDetails: Record<string, any>;

  @Column({ type: 'boolean', default: false, comment: '是否已放生' })
  wasReleased: boolean;

  @Column({ type: 'boolean', default: false, comment: '是否已上报' })
  wasReported: boolean;

  @CreateDateColumn({ comment: '识别时间' })
  createdAt: Date;
}
