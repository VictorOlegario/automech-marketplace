import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ServiceRequestStatus, ServiceCategory, UrgencyLevel } from '../../common/enums';
import { Quote } from '../../quotes/entities/quote.entity';
import { Review } from '../../reviews/entities/review.entity';

@Entity('service_requests')
export class ServiceRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customerId' })
  customer: User;

  @Column()
  customerId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'mechanicId' })
  mechanic: User;

  @Column({ nullable: true })
  mechanicId: string;

  @Column({ type: 'enum', enum: ServiceCategory })
  category: ServiceCategory;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'simple-array', nullable: true })
  photos: string[];

  @Column({ type: 'enum', enum: ServiceRequestStatus, default: ServiceRequestStatus.REQUESTED })
  status: ServiceRequestStatus;

  @Column({ type: 'enum', enum: UrgencyLevel, default: UrgencyLevel.MEDIUM })
  urgency: UrgencyLevel;

  @Column({ type: 'float' })
  latitude: number;

  @Column({ type: 'float' })
  longitude: number;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  vehicleInfo: string;

  @Column({ type: 'float', nullable: true })
  finalPrice: number;

  @Column({ type: 'timestamp', nullable: true })
  acceptedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt: Date;

  @Column({ nullable: true })
  cancellationReason: string;

  @OneToMany(() => Quote, (quote) => quote.serviceRequest)
  quotes: Quote[];

  @OneToMany(() => Review, (review) => review.serviceRequest)
  reviews: Review[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
