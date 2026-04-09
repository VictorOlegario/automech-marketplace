import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ServiceCategory } from '../../common/enums';

@Entity('mechanics_profile')
export class MechanicProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.mechanicProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'float', default: 0 })
  averageRating: number;

  @Column({ default: 0 })
  totalReviews: number;

  @Column({ default: 0 })
  completedServices: number;

  @Column({ type: 'int', default: 0 })
  yearsExperience: number;

  @Column({ type: 'float', default: 0 })
  responseTimeAvg: number;

  @Column({ type: 'float', default: 0 })
  acceptanceRate: number;

  @Column({ default: false })
  verifiedStatus: boolean;

  @Column({ type: 'simple-array', nullable: true })
  specialties: string[];

  @Column({ type: 'simple-array', nullable: true })
  certifications: string[];

  @Column({ type: 'simple-array', nullable: true })
  workPhotos: string[];

  @Column({ nullable: true })
  bio: string;

  @Column({ type: 'float', nullable: true })
  serviceRadiusKm: number;

  @Column({ type: 'float', nullable: true })
  minPrice: number;

  @Column({ type: 'float', nullable: true })
  maxPrice: number;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ type: 'float', nullable: true })
  latitude: number;

  @Column({ type: 'float', nullable: true })
  longitude: number;

  @Column({ nullable: true })
  serviceRegion: string;

  @CreateDateColumn()
  platformJoinDate: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
