import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { ServiceRequestsService } from '../service-requests/service-requests.service';
import { MechanicsService } from '../mechanics/mechanics.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { ServiceRequestStatus, AnalyticsEventType } from '../common/enums';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
    private readonly serviceRequestsService: ServiceRequestsService,
    private readonly mechanicsService: MechanicsService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  async create(reviewerId: string, dto: CreateReviewDto): Promise<Review> {
    const sr = await this.serviceRequestsService.findById(dto.serviceRequestId);

    if (sr.status !== ServiceRequestStatus.COMPLETED) {
      throw new BadRequestException('Can only review completed services');
    }

    if (sr.customerId !== reviewerId) {
      throw new BadRequestException(
        'Only the customer who requested the service can leave a review',
      );
    }

    const existingReview = await this.reviewsRepository.findOne({
      where: { serviceRequestId: dto.serviceRequestId, reviewerId },
    });
    if (existingReview) {
      throw new BadRequestException('You have already reviewed this service');
    }

    if (dto.score < 1 || dto.score > 5) {
      throw new BadRequestException('Score must be between 1 and 5');
    }

    const review = this.reviewsRepository.create({
      serviceRequestId: dto.serviceRequestId,
      reviewerId,
      mechanicId: sr.mechanicId,
      score: dto.score,
      comment: dto.comment,
    });
    const saved = await this.reviewsRepository.save(review);

    // Update mechanic rating stats
    await this.recalculateMechanicRating(sr.mechanicId);

    await this.analyticsService.trackEvent({
      eventType: AnalyticsEventType.REVIEW_SUBMITTED,
      userId: reviewerId,
      entityId: saved.id,
      entityType: 'review',
      metadata: {
        mechanicId: sr.mechanicId,
        score: dto.score,
        serviceRequestId: dto.serviceRequestId,
      },
    });

    return saved;
  }

  async findByMechanic(
    mechanicId: string,
    page: number = 1,
    limit: number = 10,
    sortBy: 'recent' | 'helpful' = 'recent',
  ): Promise<{ reviews: Review[]; total: number; ratingDistribution: Record<number, number> }> {
    const queryBuilder = this.reviewsRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.reviewer', 'reviewer')
      .where('review.mechanicId = :mechanicId', { mechanicId })
      .andWhere('review.isReported = false');

    if (sortBy === 'helpful') {
      queryBuilder.orderBy('review.helpfulCount', 'DESC');
    } else {
      queryBuilder.orderBy('review.reviewDate', 'DESC');
    }

    const [reviews, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Get rating distribution
    const distribution = await this.reviewsRepository
      .createQueryBuilder('review')
      .select('review.score', 'score')
      .addSelect('COUNT(*)', 'count')
      .where('review.mechanicId = :mechanicId', { mechanicId })
      .andWhere('review.isReported = false')
      .groupBy('review.score')
      .getRawMany();

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distribution.forEach((d: { score: number; count: string }) => {
      ratingDistribution[d.score] = parseInt(d.count, 10);
    });

    return { reviews, total, ratingDistribution };
  }

  async reportReview(reviewId: string, reportReason: string): Promise<Review> {
    const review = await this.reviewsRepository.findOne({ where: { id: reviewId } });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    review.isReported = true;
    review.reportReason = reportReason;
    return this.reviewsRepository.save(review);
  }

  async markHelpful(reviewId: string): Promise<Review> {
    const review = await this.reviewsRepository.findOne({ where: { id: reviewId } });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    review.helpfulCount += 1;
    return this.reviewsRepository.save(review);
  }

  private async recalculateMechanicRating(mechanicId: string): Promise<void> {
    const result = await this.reviewsRepository
      .createQueryBuilder('review')
      .select('AVG(review.score)', 'avgRating')
      .addSelect('COUNT(*)', 'totalReviews')
      .where('review.mechanicId = :mechanicId', { mechanicId })
      .andWhere('review.isReported = false')
      .getRawOne();

    const avgRating = parseFloat(result.avgRating) || 0;
    const totalReviews = parseInt(result.totalReviews, 10) || 0;

    await this.mechanicsService.updateRatingStats(
      mechanicId,
      Math.round(avgRating * 10) / 10,
      totalReviews,
    );
  }
}
