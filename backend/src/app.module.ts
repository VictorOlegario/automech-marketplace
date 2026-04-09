import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MechanicsModule } from './mechanics/mechanics.module';
import { CustomersModule } from './customers/customers.module';
import { ServiceRequestsModule } from './service-requests/service-requests.module';
import { QuotesModule } from './quotes/quotes.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { GeolocationModule } from './geolocation/geolocation.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'automech',
      password: process.env.DB_PASSWORD || 'automech_secret',
      database: process.env.DB_NAME || 'automech_db',
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
    }),
    AuthModule,
    UsersModule,
    MechanicsModule,
    CustomersModule,
    ServiceRequestsModule,
    QuotesModule,
    ReviewsModule,
    AnalyticsModule,
    GeolocationModule,
  ],
})
export class AppModule {}
