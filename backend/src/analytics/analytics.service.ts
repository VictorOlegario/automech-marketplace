import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AnalyticsEvent } from './entities/analytics-event.entity';
import { AnalyticsEventType } from '../common/enums';

interface TrackEventParams {
  eventType: AnalyticsEventType;
  userId?: string;
  entityId?: string;
  entityType?: string;
  metadata?: Record<string, any>;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AnalyticsEvent)
    private readonly analyticsRepository: Repository<AnalyticsEvent>,
  ) {}

  async trackEvent(params: TrackEventParams): Promise<AnalyticsEvent> {
    const event = this.analyticsRepository.create(params);
    return this.analyticsRepository.save(event);
  }

  async getEventsByType(
    eventType: AnalyticsEventType,
    startDate?: Date,
    endDate?: Date,
  ): Promise<AnalyticsEvent[]> {
    const where: any = { eventType };
    if (startDate && endDate) {
      where.timestamp = Between(startDate, endDate);
    }
    return this.analyticsRepository.find({
      where,
      order: { timestamp: 'DESC' },
      take: 1000,
    });
  }

  async getMetrics(startDate?: Date, endDate?: Date): Promise<Record<string, any>> {
    const dateWhere: any = {};
    if (startDate && endDate) {
      dateWhere.timestamp = Between(startDate, endDate);
    }

    // Total service requests
    const totalRequests = await this.analyticsRepository.count({
      where: { ...dateWhere, eventType: AnalyticsEventType.SERVICE_REQUESTED },
    });

    // Completed services
    const completedServices = await this.analyticsRepository.count({
      where: { ...dateWhere, eventType: AnalyticsEventType.SERVICE_COMPLETED },
    });

    // Conversion rate
    const conversionRate =
      totalRequests > 0 ? Math.round((completedServices / totalRequests) * 100 * 10) / 10 : 0;

    // Cancellations
    const cancellations = await this.analyticsRepository.count({
      where: { ...dateWhere, eventType: AnalyticsEventType.SERVICE_CANCELLED },
    });

    // Average time to accept (from metadata)
    const acceptEvents = await this.analyticsRepository.find({
      where: { ...dateWhere, eventType: AnalyticsEventType.SERVICE_ACCEPTED },
    });
    const avgTimeToAccept =
      acceptEvents.length > 0
        ? Math.round(
            acceptEvents.reduce((sum, e) => sum + (e.metadata?.timeToAcceptMinutes || 0), 0) /
              acceptEvents.length,
          )
        : 0;

    // Average time to complete
    const completeEvents = await this.analyticsRepository.find({
      where: { ...dateWhere, eventType: AnalyticsEventType.SERVICE_COMPLETED },
    });
    const avgTimeToComplete =
      completeEvents.length > 0
        ? Math.round(
            completeEvents.reduce((sum, e) => sum + (e.metadata?.timeToCompleteMinutes || 0), 0) /
              completeEvents.length,
          )
        : 0;

    // Average ticket
    const avgTicket =
      completeEvents.length > 0
        ? Math.round(
            (completeEvents.reduce((sum, e) => sum + (e.metadata?.finalPrice || 0), 0) /
              completeEvents.length) *
              100,
          ) / 100
        : 0;

    // New registrations
    const newUsers = await this.analyticsRepository.count({
      where: { ...dateWhere, eventType: AnalyticsEventType.USER_REGISTERED },
    });

    // Profile views
    const profileViews = await this.analyticsRepository.count({
      where: { ...dateWhere, eventType: AnalyticsEventType.MECHANIC_PROFILE_VIEWED },
    });

    return {
      totalRequests,
      completedServices,
      conversionRate,
      cancellations,
      cancellationRate:
        totalRequests > 0 ? Math.round((cancellations / totalRequests) * 100 * 10) / 10 : 0,
      avgTimeToAcceptMinutes: avgTimeToAccept,
      avgTimeToCompleteMinutes: avgTimeToComplete,
      avgTicket,
      newUsers,
      profileViews,
      quotesAccepted: await this.analyticsRepository.count({
        where: { ...dateWhere, eventType: AnalyticsEventType.QUOTE_ACCEPTED },
      }),
      quotesRejected: await this.analyticsRepository.count({
        where: { ...dateWhere, eventType: AnalyticsEventType.QUOTE_REJECTED },
      }),
    };
  }

  async getRecentEvents(limit: number = 50): Promise<AnalyticsEvent[]> {
    return this.analyticsRepository.find({
      order: { timestamp: 'DESC' },
      take: limit,
      relations: ['user'],
    });
  }
}
