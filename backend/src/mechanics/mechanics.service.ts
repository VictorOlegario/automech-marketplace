import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MechanicProfile } from './entities/mechanic-profile.entity';
import { UpdateMechanicProfileDto } from './dto/update-mechanic-profile.dto';

@Injectable()
export class MechanicsService {
  constructor(
    @InjectRepository(MechanicProfile)
    private readonly mechanicsRepository: Repository<MechanicProfile>,
  ) {}

  async createProfile(data: Partial<MechanicProfile>): Promise<MechanicProfile> {
    const profile = this.mechanicsRepository.create(data);
    return this.mechanicsRepository.save(profile);
  }

  async findByUserId(userId: string): Promise<MechanicProfile> {
    const profile = await this.mechanicsRepository.findOne({
      where: { userId },
      relations: ['user'],
    });
    if (!profile) {
      throw new NotFoundException('Mechanic profile not found');
    }
    return profile;
  }

  async findById(id: string): Promise<MechanicProfile> {
    const profile = await this.mechanicsRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!profile) {
      throw new NotFoundException('Mechanic profile not found');
    }
    return profile;
  }

  async updateProfile(userId: string, data: UpdateMechanicProfileDto): Promise<MechanicProfile> {
    const profile = await this.findByUserId(userId);
    Object.assign(profile, data);
    return this.mechanicsRepository.save(profile);
  }

  async findNearby(
    latitude: number,
    longitude: number,
    radiusKm: number = 20,
    sortBy: 'distance' | 'rating' = 'distance',
  ): Promise<(MechanicProfile & { distanceKm: number })[]> {
    // Haversine formula for distance calculation
    const query = this.mechanicsRepository
      .createQueryBuilder('mechanic')
      .leftJoinAndSelect('mechanic.user', 'user')
      .addSelect(
        `(6371 * acos(cos(radians(:lat)) * cos(radians(mechanic.latitude)) * cos(radians(mechanic.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(mechanic.latitude))))`,
        'distanceKm',
      )
      .where('mechanic.isAvailable = :available', { available: true })
      .andWhere('mechanic.latitude IS NOT NULL')
      .andWhere('mechanic.longitude IS NOT NULL')
      .having(
        `(6371 * acos(cos(radians(:lat)) * cos(radians(mechanic.latitude)) * cos(radians(mechanic.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(mechanic.latitude)))) < :radius`,
      )
      .setParameters({ lat: latitude, lng: longitude, radius: radiusKm })
      .groupBy('mechanic.id')
      .addGroupBy('user.id');

    if (sortBy === 'rating') {
      query.orderBy('mechanic.averageRating', 'DESC').addOrderBy('distanceKm', 'ASC');
    } else {
      query.orderBy('distanceKm', 'ASC');
    }

    const results = await query.getRawAndEntities();

    return results.entities.map((entity, index) => ({
      ...entity,
      distanceKm: parseFloat(results.raw[index]?.distanceKm || '0'),
    }));
  }

  async updateRatingStats(
    mechanicUserId: string,
    averageRating: number,
    totalReviews: number,
  ): Promise<void> {
    await this.mechanicsRepository.update(
      { userId: mechanicUserId },
      { averageRating, totalReviews },
    );
  }

  async incrementCompletedServices(userId: string): Promise<void> {
    await this.mechanicsRepository.increment({ userId }, 'completedServices', 1);
  }

  async updateAvailability(userId: string, isAvailable: boolean): Promise<MechanicProfile> {
    await this.mechanicsRepository.update({ userId }, { isAvailable });
    return this.findByUserId(userId);
  }

  async updateLocation(
    userId: string,
    latitude: number,
    longitude: number,
  ): Promise<MechanicProfile> {
    await this.mechanicsRepository.update({ userId }, { latitude, longitude });
    return this.findByUserId(userId);
  }

  async getTopRated(limit: number = 10): Promise<MechanicProfile[]> {
    return this.mechanicsRepository.find({
      where: { isAvailable: true },
      relations: ['user'],
      order: { averageRating: 'DESC', totalReviews: 'DESC' },
      take: limit,
    });
  }
}
