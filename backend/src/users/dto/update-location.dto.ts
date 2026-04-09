import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLocationDto {
  @ApiProperty({ example: -23.5505 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: -46.6333 })
  @IsNumber()
  longitude: number;
}
