import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ServiceRequest } from '../../service-requests/entities/service-request.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ServiceRequest, (sr) => sr.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'serviceRequestId' })
  serviceRequest: ServiceRequest;

  @Column()
  serviceRequestId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewerId' })
  reviewer: User;

  @Column()
  reviewerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'mechanicId' })
  mechanic: User;

  @Column()
  mechanicId: string;

  @Column({ type: 'int' })
  score: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ default: false })
  isReported: boolean;

  @Column({ nullable: true })
  reportReason: string;

  @Column({ type: 'int', default: 0 })
  helpfulCount: number;

  @CreateDateColumn()
  reviewDate: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
