import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceRequest } from './entities/service-request.entity';
import { ServiceRequestsService } from './service-requests.service';
import { ServiceRequestsController } from './service-requests.controller';
import { MechanicsModule } from '../mechanics/mechanics.module';
import { CustomersModule } from '../customers/customers.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceRequest]),
    MechanicsModule,
    CustomersModule,
    AnalyticsModule,
  ],
  providers: [ServiceRequestsService],
  controllers: [ServiceRequestsController],
  exports: [ServiceRequestsService],
})
export class ServiceRequestsModule {}
