import { IsString, IsNumber, IsOptional, IsUUID, IsDateString, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuoteDto {
  @ApiProperty({ example: 'uuid-of-service-request' })
  @IsUUID()
  serviceRequestId: string;

  @ApiProperty({ example: 250.0 })
  @IsNumber()
  estimatedPrice: number;

  @ApiPropertyOptional({ example: 'Battery replacement including parts and labor' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  @IsInt()
  estimatedDurationMinutes?: number;

  @ApiPropertyOptional({ example: '2024-12-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
