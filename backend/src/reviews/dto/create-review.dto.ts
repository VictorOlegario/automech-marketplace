import { IsString, IsInt, IsOptional, IsUUID, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ example: 'uuid-of-service-request' })
  @IsUUID()
  serviceRequestId: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  score: number;

  @ApiPropertyOptional({ example: 'Great mechanic, fixed my car quickly!' })
  @IsOptional()
  @IsString()
  comment?: string;
}
