import { IsString, IsOptional, IsNumber, IsArray, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMechanicProfileDto {
  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  yearsExperience?: number;

  @ApiPropertyOptional({ example: ['engine', 'brakes'] })
  @IsOptional()
  @IsArray()
  specialties?: string[];

  @ApiPropertyOptional({ example: ['ASE Certified'] })
  @IsOptional()
  @IsArray()
  certifications?: string[];

  @ApiPropertyOptional({ example: 'Experienced mechanic specializing in engines' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: 15 })
  @IsOptional()
  @IsNumber()
  serviceRadiusKm?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ example: ['https://example.com/photo1.jpg'] })
  @IsOptional()
  @IsArray()
  workPhotos?: string[];

  @ApiPropertyOptional({ example: 'São Paulo - Zona Sul' })
  @IsOptional()
  @IsString()
  serviceRegion?: string;
}
