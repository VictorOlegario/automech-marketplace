import { IsEnum, IsOptional, IsNumber, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceRequestStatus } from '../../common/enums';

export class UpdateServiceStatusDto {
  @ApiProperty({ enum: ServiceRequestStatus, example: ServiceRequestStatus.ACCEPTED })
  @IsEnum(ServiceRequestStatus)
  status: ServiceRequestStatus;

  @ApiPropertyOptional({ example: 250.0 })
  @IsOptional()
  @IsNumber()
  finalPrice?: number;

  @ApiPropertyOptional({ example: 'Customer cancelled' })
  @IsOptional()
  @IsString()
  cancellationReason?: string;
}
