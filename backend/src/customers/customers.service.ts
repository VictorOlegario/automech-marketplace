import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerProfile } from './entities/customer-profile.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(CustomerProfile)
    private readonly customersRepository: Repository<CustomerProfile>,
  ) {}

  async createProfile(data: Partial<CustomerProfile>): Promise<CustomerProfile> {
    const profile = this.customersRepository.create(data);
    return this.customersRepository.save(profile);
  }

  async findByUserId(userId: string): Promise<CustomerProfile> {
    const profile = await this.customersRepository.findOne({
      where: { userId },
      relations: ['user'],
    });
    if (!profile) {
      throw new NotFoundException('Customer profile not found');
    }
    return profile;
  }

  async updateProfile(userId: string, data: Partial<CustomerProfile>): Promise<CustomerProfile> {
    const profile = await this.findByUserId(userId);
    Object.assign(profile, data);
    return this.customersRepository.save(profile);
  }

  async incrementServicesRequested(userId: string): Promise<void> {
    await this.customersRepository.increment({ userId }, 'totalServicesRequested', 1);
  }

  async incrementServicesCompleted(userId: string): Promise<void> {
    await this.customersRepository.increment({ userId }, 'totalServicesCompleted', 1);
  }
}
