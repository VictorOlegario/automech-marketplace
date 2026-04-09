import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { AnalyticsEventType } from '../../common/enums';

@Entity('analytics_events')
export class AnalyticsEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: AnalyticsEventType })
  eventType: AnalyticsEventType;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  entityId: string;

  @Column({ nullable: true })
  entityType: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  sessionId: string;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @CreateDateColumn()
  timestamp: Date;
}
