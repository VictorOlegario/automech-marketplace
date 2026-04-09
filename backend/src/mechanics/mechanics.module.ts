import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MechanicProfile } from './entities/mechanic-profile.entity';
import { MechanicsService } from './mechanics.service';
import { MechanicsController } from './mechanics.controller';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [TypeOrmModule.forFeature([MechanicProfile]), AnalyticsModule],
  providers: [MechanicsService],
  controllers: [MechanicsController],
  exports: [MechanicsService],
})
export class MechanicsModule {}
