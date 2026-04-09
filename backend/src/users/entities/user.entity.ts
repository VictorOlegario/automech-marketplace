import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { UserRole } from '../../common/enums';
import { MechanicProfile } from '../../mechanics/entities/mechanic-profile.entity';
import { CustomerProfile } from '../../customers/entities/customer-profile.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  fullName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  profilePhotoUrl: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'float', nullable: true })
  latitude: number;

  @Column({ type: 'float', nullable: true })
  longitude: number;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => MechanicProfile, (profile) => profile.user, { nullable: true })
  mechanicProfile: MechanicProfile;

  @OneToOne(() => CustomerProfile, (profile) => profile.user, { nullable: true })
  customerProfile: CustomerProfile;
}
