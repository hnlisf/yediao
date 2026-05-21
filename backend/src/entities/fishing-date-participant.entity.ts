import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Unique
} from 'typeorm';
import { User } from './user.entity';
import { FishingDate } from './fishing-date.entity';

@Entity('fishing_date_participants')
@Unique(['userId', 'fishingDateId'])
export class FishingDateParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', comment: '用户ID' })
  userId: string;

  @ManyToOne(() => User, user => user.fishingDateParticipants)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid', comment: '约钓ID' })
  fishingDateId: string;

  @ManyToOne(() => FishingDate, fd => fd.participants)
  @JoinColumn({ name: 'fishingDateId' })
  fishingDate: FishingDate;

  @Column({ default: false, comment: '是否确认参加' })
  isConfirmed: boolean;

  @CreateDateColumn({ comment: '报名时间' })
  createdAt: Date;
}
