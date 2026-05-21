import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn
} from 'typeorm';
import { User } from './user.entity';
import { Spot } from './spot.entity';

export enum ReviewAction {
  APPROVE = 'approve',
  REJECT = 'reject',
}

@Entity('spot_reviews')
export class SpotReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', comment: '钓点ID' })
  spotId: string;

  @ManyToOne(() => Spot)
  @JoinColumn({ name: 'spotId' })
  spot: Spot;

  @Column({ type: 'uuid', comment: '审核员ID' })
  reviewerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewerId' })
  reviewer: User;

  @Column({ type: 'enum', enum: ReviewAction, comment: '审核动作' })
  action: ReviewAction;

  @Column({ type: 'text', nullable: true, comment: '审核备注' })
  note: string;

  @CreateDateColumn({ comment: '审核时间' })
  createdAt: Date;
}
