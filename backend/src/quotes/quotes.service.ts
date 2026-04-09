import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quote } from './entities/quote.entity';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { QuoteStatus, ServiceRequestStatus, AnalyticsEventType } from '../common/enums';
import { ServiceRequestsService } from '../service-requests/service-requests.service';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(Quote)
    private readonly quotesRepository: Repository<Quote>,
    private readonly serviceRequestsService: ServiceRequestsService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  async create(mechanicId: string, dto: CreateQuoteDto): Promise<Quote> {
    const sr = await this.serviceRequestsService.findById(dto.serviceRequestId);
    if (sr.status !== ServiceRequestStatus.REQUESTED && sr.status !== ServiceRequestStatus.QUOTED) {
      throw new BadRequestException('Service request is no longer accepting quotes');
    }

    const existingQuote = await this.quotesRepository.findOne({
      where: { serviceRequestId: dto.serviceRequestId, mechanicId },
    });
    if (existingQuote) {
      throw new BadRequestException('You have already submitted a quote for this service request');
    }

    const quote = this.quotesRepository.create({
      mechanicId,
      serviceRequestId: dto.serviceRequestId,
      estimatedPrice: dto.estimatedPrice,
      description: dto.description,
      estimatedDurationMinutes: dto.estimatedDurationMinutes,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    });
    const saved = (await this.quotesRepository.save(quote)) as Quote;

    if (sr.status === ServiceRequestStatus.REQUESTED) {
      await this.serviceRequestsService.updateStatus(sr.id, mechanicId, {
        status: ServiceRequestStatus.QUOTED,
      });
    }

    await this.analyticsService.trackEvent({
      eventType: AnalyticsEventType.QUOTE_SENT,
      userId: mechanicId,
      entityId: saved.id,
      entityType: 'quote',
      metadata: {
        serviceRequestId: dto.serviceRequestId,
        estimatedPrice: dto.estimatedPrice,
        estimatedDurationMinutes: dto.estimatedDurationMinutes,
      },
    });

    return saved;
  }

  async findByServiceRequest(serviceRequestId: string): Promise<Quote[]> {
    return this.quotesRepository.find({
      where: { serviceRequestId },
      relations: ['mechanic'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByMechanic(mechanicId: string): Promise<Quote[]> {
    return this.quotesRepository.find({
      where: { mechanicId },
      relations: ['serviceRequest'],
      order: { createdAt: 'DESC' },
    });
  }

  async acceptQuote(quoteId: string, customerId: string): Promise<Quote> {
    const quote = await this.quotesRepository.findOne({
      where: { id: quoteId },
      relations: ['serviceRequest'],
    });
    if (!quote) {
      throw new NotFoundException('Quote not found');
    }
    if (quote.serviceRequest.customerId !== customerId) {
      throw new BadRequestException('You can only accept quotes for your own service requests');
    }
    if (quote.status !== QuoteStatus.PENDING) {
      throw new BadRequestException('Quote is no longer pending');
    }

    quote.status = QuoteStatus.ACCEPTED;
    quote.respondedAt = new Date();
    await this.quotesRepository.save(quote);

    // Reject other quotes for this service request
    await this.quotesRepository
      .createQueryBuilder()
      .update(Quote)
      .set({ status: QuoteStatus.REJECTED, respondedAt: new Date() })
      .where('serviceRequestId = :srId AND id != :quoteId AND status = :pending', {
        srId: quote.serviceRequestId,
        quoteId: quote.id,
        pending: QuoteStatus.PENDING,
      })
      .execute();

    await this.serviceRequestsService.updateStatus(quote.serviceRequestId, quote.mechanicId, {
      status: ServiceRequestStatus.ACCEPTED,
    });

    await this.analyticsService.trackEvent({
      eventType: AnalyticsEventType.QUOTE_ACCEPTED,
      userId: customerId,
      entityId: quoteId,
      entityType: 'quote',
      metadata: {
        mechanicId: quote.mechanicId,
        estimatedPrice: quote.estimatedPrice,
        serviceRequestId: quote.serviceRequestId,
      },
    });

    return quote;
  }

  async rejectQuote(quoteId: string, customerId: string): Promise<Quote> {
    const quote = await this.quotesRepository.findOne({
      where: { id: quoteId },
      relations: ['serviceRequest'],
    });
    if (!quote) {
      throw new NotFoundException('Quote not found');
    }
    if (quote.serviceRequest.customerId !== customerId) {
      throw new BadRequestException('You can only reject quotes for your own service requests');
    }

    quote.status = QuoteStatus.REJECTED;
    quote.respondedAt = new Date();

    await this.analyticsService.trackEvent({
      eventType: AnalyticsEventType.QUOTE_REJECTED,
      userId: customerId,
      entityId: quoteId,
      entityType: 'quote',
      metadata: {
        mechanicId: quote.mechanicId,
        estimatedPrice: quote.estimatedPrice,
      },
    });

    return this.quotesRepository.save(quote);
  }
}
