import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum AuditAction {
  PROTECTED_SPECIES_DETECTED = 'PROTECTED_SPECIES_DETECTED',
  SPECIES_RELEASED = 'SPECIES_RELEASED',
  SPECIES_REPORTED = 'SPECIES_REPORTED',
}

@Entity('audit_logs')
@Index(['userId', 'createdAt'])
@Index(['action'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', comment: '用户ID' })
  userId: string;

  @Column({ type: 'enum', enum: AuditAction, comment: '操作类型' })
  action: AuditAction;

  @Column({ type: 'jsonb', comment: '元数据' })
  metadata: Record<string, any>;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;
}
