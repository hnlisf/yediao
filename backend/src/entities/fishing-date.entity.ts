import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany, ManyToOne, JoinColumn
} from 'typeorm';
import { User } from './user.entity';
import { FishingDateParticipant } from './fishing-date-participant.entity';

export enum FishingDateStatus {
  OPEN = 'open',
  FULL = 'full',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}

@Entity('fishing_dates')
export class FishingDate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', comment: '创建者ID' })
  creatorId: string;

  @ManyToOne(() => User, user => user.createdFishingDates)
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @Column({ type: 'varchar', length: 200, comment: '标题' })
  title: string;

  @Column({ type: 'text', nullable: true, comment: '描述' })
  description: string;

  @Column({ type: 'uuid', nullable: true, comment: '钓点ID' })
  spotId: string;

  @Column({ type: 'varchar', length: 200, nullable: true, comment: '地点名称' })
  locationName: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true, comment: '经度' })
  longitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true, comment: '纬度' })
  latitude: number;

  @Column({ type: 'timestamp', comment: '开始时间' })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true, comment: '结束时间' })
  endTime: Date;

  @Column({ type: 'int', default: 2, comment: '人数上限' })
  maxParticipants: number;

  @Column({ type: 'int', default: 0, comment: '当前人数' })
  currentParticipants: number;

  @Column({ type: 'enum', enum: FishingDateStatus, default: FishingDateStatus.OPEN, comment: '状态' })
  status: FishingDateStatus;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  @OneToMany(() => FishingDateParticipant, fdp => fdp.fishingDate)
  participants: FishingDateParticipant[];
}
