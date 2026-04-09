import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerProfile } from './entities/customer-profile.entity';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerProfile])],
  providers: [CustomersService],
  controllers: [CustomersController],
  exports: [CustomersService],
})
export class CustomersModule {}
