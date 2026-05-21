import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Unique
} from 'typeorm';
import { User } from './user.entity';
import { Spot } from './spot.entity';

@Entity('spot_favorites')
@Unique(['userId', 'spotId'])
export class SpotFavorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', comment: '用户ID' })
  userId: string;

  @ManyToOne(() => User, user => user.spotFavorites)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid', comment: '钓点ID' })
  spotId: string;

  @ManyToOne(() => Spot, spot => spot.favorites)
  @JoinColumn({ name: 'spotId' })
  spot: Spot;

  @CreateDateColumn({ comment: '收藏时间' })
  createdAt: Date;
}
