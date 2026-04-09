import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceRequest } from './entities/service-request.entity';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { UpdateServiceStatusDto } from './dto/update-service-status.dto';
import { ServiceRequestStatus, AnalyticsEventType } from '../common/enums';
import { MechanicsService } from '../mechanics/mechanics.service';
import { CustomersService } from '../customers/customers.service';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class ServiceRequestsService {
  constructor(
    @InjectRepository(ServiceRequest)
    private readonly serviceRequestsRepository: Repository<ServiceRequest>,
    private readonly mechanicsService: MechanicsService,
    private readonly customersService: CustomersService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  async create(customerId: string, dto: CreateServiceRequestDto): Promise<ServiceRequest> {
    const serviceRequest = this.serviceRequestsRepository.create({
      customerId,
      ...dto,
    });
    const saved = await this.serviceRequestsRepository.save(serviceRequest);

    await this.customersService.incrementServicesRequested(customerId);

    await this.analyticsService.trackEvent({
      eventType: AnalyticsEventType.SERVICE_REQUESTED,
      userId: customerId,
      entityId: saved.id,
      entityType: 'service_request',
      metadata: {
        category: dto.category,
        urgency: dto.urgency,
      },
    });

    return saved;
  }

  async findById(id: string): Promise<ServiceRequest> {
    const sr = await this.serviceRequestsRepository.findOne({
      where: { id },
      relations: ['customer', 'mechanic', 'quotes', 'reviews'],
    });
    if (!sr) {
      throw new NotFoundException('Service request not found');
    }
    return sr;
  }

  async findByCustomer(customerId: string): Promise<ServiceRequest[]> {
    return this.serviceRequestsRepository.find({
      where: { customerId },
      relations: ['mechanic', 'quotes'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByMechanic(mechanicId: string): Promise<ServiceRequest[]> {
    return this.serviceRequestsRepository.find({
      where: { mechanicId },
      relations: ['customer', 'quotes'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAvailableRequests(
    latitude: number,
    longitude: number,
    radiusKm: number = 20,
  ): Promise<ServiceRequest[]> {
    return this.serviceRequestsRepository
      .createQueryBuilder('sr')
      .leftJoinAndSelect('sr.customer', 'customer')
      .addSelect(
        `(6371 * acos(cos(radians(:lat)) * cos(radians(sr.latitude)) * cos(radians(sr.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(sr.latitude))))`,
        'distance',
      )
      .where('sr.status IN (:...statuses)', { statuses: [ServiceRequestStatus.REQUESTED, ServiceRequestStatus.QUOTED] })
      .having(
        `(6371 * acos(cos(radians(:lat)) * cos(radians(sr.latitude)) * cos(radians(sr.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(sr.latitude)))) < :radius`,
      )
      .setParameters({ lat: latitude, lng: longitude, radius: radiusKm })
      .groupBy('sr.id')
      .addGroupBy('customer.id')
      .orderBy('distance', 'ASC')
      .getMany();
  }

  async updateStatus(
    id: string,
    userId: string,
    dto: UpdateServiceStatusDto,
  ): Promise<ServiceRequest> {
    const sr = await this.findById(id);
    const now = new Date();

    // Authorization: only the customer or the assigned mechanic can update
    if (sr.customerId !== userId && sr.mechanicId !== userId && sr.mechanicId !== null) {
      throw new ForbiddenException('You are not authorized to update this service request');
    }

    const previousStatus = sr.status;

    const validTransitions: Record<ServiceRequestStatus, ServiceRequestStatus[]> = {
      [ServiceRequestStatus.REQUESTED]: [
        ServiceRequestStatus.QUOTED,
        ServiceRequestStatus.CANCELLED,
      ],
      [ServiceRequestStatus.QUOTED]: [
        ServiceRequestStatus.ACCEPTED,
        ServiceRequestStatus.CANCELLED,
      ],
      [ServiceRequestStatus.ACCEPTED]: [
        ServiceRequestStatus.IN_TRANSIT,
        ServiceRequestStatus.CANCELLED,
      ],
      [ServiceRequestStatus.IN_TRANSIT]: [
        ServiceRequestStatus.IN_PROGRESS,
        ServiceRequestStatus.CANCELLED,
      ],
      [ServiceRequestStatus.IN_PROGRESS]: [
        ServiceRequestStatus.COMPLETED,
        ServiceRequestStatus.CANCELLED,
      ],
      [ServiceRequestStatus.COMPLETED]: [],
      [ServiceRequestStatus.CANCELLED]: [],
    };

    if (!validTransitions[sr.status]?.includes(dto.status)) {
      throw new BadRequestException(`Cannot transition from ${sr.status} to ${dto.status}`);
    }

    sr.status = dto.status;

    switch (dto.status) {
      case ServiceRequestStatus.ACCEPTED:
        sr.acceptedAt = now;
        sr.mechanicId = userId;
        break;
      case ServiceRequestStatus.IN_PROGRESS:
        sr.startedAt = now;
        break;
      case ServiceRequestStatus.COMPLETED:
        sr.completedAt = now;
        sr.finalPrice = dto.finalPrice ?? 0;
        await this.mechanicsService.incrementCompletedServices(sr.mechanicId);
        await this.customersService.incrementServicesCompleted(sr.customerId);
        break;
      case ServiceRequestStatus.CANCELLED:
        sr.cancelledAt = now;
        sr.cancellationReason = dto.cancellationReason ?? '';
        break;
    }

    const saved = await this.serviceRequestsRepository.save(sr);

    const eventTypeMap: Partial<Record<ServiceRequestStatus, AnalyticsEventType>> = {
      [ServiceRequestStatus.ACCEPTED]: AnalyticsEventType.SERVICE_ACCEPTED,
      [ServiceRequestStatus.IN_PROGRESS]: AnalyticsEventType.SERVICE_STARTED,
      [ServiceRequestStatus.COMPLETED]: AnalyticsEventType.SERVICE_COMPLETED,
      [ServiceRequestStatus.CANCELLED]: AnalyticsEventType.SERVICE_CANCELLED,
    };

    const eventType = eventTypeMap[dto.status];
    if (eventType) {
      await this.analyticsService.trackEvent({
        eventType,
        userId,
        entityId: id,
        entityType: 'service_request',
        metadata: {
          previousStatus,
          newStatus: dto.status,
          finalPrice: dto.finalPrice,
          timeToAcceptMinutes: sr.acceptedAt
            ? Math.round((sr.acceptedAt.getTime() - sr.createdAt.getTime()) / 60000)
            : undefined,
          timeToCompleteMinutes:
            sr.completedAt && sr.startedAt
              ? Math.round((sr.completedAt.getTime() - sr.startedAt.getTime()) / 60000)
              : undefined,
        },
      });
    }

    return saved;
  }
}
