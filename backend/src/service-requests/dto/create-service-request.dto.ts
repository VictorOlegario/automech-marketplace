import { IsString, IsEnum, IsNumber, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceCategory, UrgencyLevel } from '../../common/enums';

export class CreateServiceRequestDto {
  @ApiProperty({ enum: ServiceCategory, example: ServiceCategory.BATTERY })
  @IsEnum(ServiceCategory)
  category: ServiceCategory;

  @ApiProperty({ example: 'Car battery dead' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'My car battery died this morning and I need help.' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: ['https://example.com/photo1.jpg'] })
  @IsOptional()
  @IsArray()
  photos?: string[];

  @ApiProperty({ example: -23.5505 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: -46.6333 })
  @IsNumber()
  longitude: number;

  @ApiPropertyOptional({ example: 'Av. Paulista, 1000, São Paulo' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'Toyota Corolla 2022 - White' })
  @IsOptional()
  @IsString()
  vehicleInfo?: string;

  @ApiPropertyOptional({ enum: UrgencyLevel, example: UrgencyLevel.HIGH })
  @IsOptional()
  @IsEnum(UrgencyLevel)
  urgency?: UrgencyLevel;
}
