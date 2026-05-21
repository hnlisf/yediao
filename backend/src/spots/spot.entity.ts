import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('spots')
export class Spot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitude: number;

  @Column({ type: 'text', array: true, nullable: true })
  fish_species: string[];

  @Column({ length: 50, nullable: true })
  water_depth: string;

  @Column({ length: 50, nullable: true })
  water_temp: string;

  @Column({ type: 'text', array: true, nullable: true })
  bait: string[];

  @Column({ type: 'text', array: true, nullable: true })
  fishing_methods: string[];

  @Column({ type: 'text', array: true, nullable: true })
  photos: string[];

  @Column({ nullable: true })
  creator_id: number;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}