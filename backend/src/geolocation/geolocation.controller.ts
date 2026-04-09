import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { GeolocationService } from './geolocation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('geolocation')
@Controller('geolocation')
export class GeolocationController {
  constructor(private readonly geolocationService: GeolocationService) {}

  @Get('distance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Calculate distance between two points' })
  @ApiQuery({ name: 'lat1', type: Number })
  @ApiQuery({ name: 'lng1', type: Number })
  @ApiQuery({ name: 'lat2', type: Number })
  @ApiQuery({ name: 'lng2', type: Number })
  async getDistance(
    @Query('lat1') lat1: number,
    @Query('lng1') lng1: number,
    @Query('lat2') lat2: number,
    @Query('lng2') lng2: number,
  ) {
    const distance = this.geolocationService.calculateDistance(
      Number(lat1),
      Number(lng1),
      Number(lat2),
      Number(lng2),
    );
    return { distanceKm: distance };
  }

  @Get('estimate-price')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get price estimate for a service category' })
  @ApiQuery({ name: 'category', type: String })
  async estimatePrice(@Query('category') category: string) {
    return this.geolocationService.estimatePrice(category);
  }

  @Get('classify-urgency')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Classify urgency of a problem' })
  @ApiQuery({ name: 'category', type: String })
  @ApiQuery({ name: 'description', type: String })
  async classifyUrgency(
    @Query('category') category: string,
    @Query('description') description: string,
  ) {
    return { urgency: this.geolocationService.classifyUrgency(category, description) };
  }
}
