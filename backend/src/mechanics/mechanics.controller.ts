import { Controller, Get, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MechanicsService } from './mechanics.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UpdateMechanicProfileDto } from './dto/update-mechanic-profile.dto';
import { UserRole, AnalyticsEventType } from '../common/enums';

@ApiTags('mechanics')
@Controller('mechanics')
export class MechanicsController {
  constructor(
    private readonly mechanicsService: MechanicsService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Get('nearby')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find nearby mechanics' })
  @ApiQuery({ name: 'latitude', type: Number, required: true })
  @ApiQuery({ name: 'longitude', type: Number, required: true })
  @ApiQuery({ name: 'radius', type: Number, required: false })
  @ApiQuery({ name: 'sortBy', enum: ['distance', 'rating'], required: false })
  async findNearby(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radius') radius?: number,
    @Query('sortBy') sortBy?: 'distance' | 'rating',
  ) {
    return this.mechanicsService.findNearby(
      Number(latitude),
      Number(longitude),
      radius ? Number(radius) : 20,
      sortBy || 'distance',
    );
  }

  @Get('top-rated')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get top rated mechanics' })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  async getTopRated(@Query('limit') limit?: number) {
    return this.mechanicsService.getTopRated(limit ? Number(limit) : 10);
  }

  @Get('profile/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get mechanic profile by user ID' })
  async getProfile(@Param('userId') userId: string, @Request() req: any) {
    const profile = await this.mechanicsService.findByUserId(userId);

    await this.analyticsService.trackEvent({
      eventType: AnalyticsEventType.MECHANIC_PROFILE_VIEWED,
      userId: req.user.id,
      entityId: userId,
      entityType: 'mechanic_profile',
    });

    const { user, ...profileData } = profile;
    const { password, ...userData } = user;
    return {
      ...profileData,
      user: userData,
      isNew: this.isNewOnPlatform(profile.platformJoinDate),
    };
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MECHANIC)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update mechanic profile' })
  async updateProfile(@Request() req: any, @Body() dto: UpdateMechanicProfileDto) {
    return this.mechanicsService.updateProfile(req.user.id, dto);
  }

  @Put('availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MECHANIC)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle mechanic availability' })
  async toggleAvailability(@Request() req: any, @Body('isAvailable') isAvailable: boolean) {
    return this.mechanicsService.updateAvailability(req.user.id, isAvailable);
  }

  @Put('location')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MECHANIC)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update mechanic location' })
  async updateLocation(
    @Request() req: any,
    @Body('latitude') latitude: number,
    @Body('longitude') longitude: number,
  ) {
    return this.mechanicsService.updateLocation(req.user.id, latitude, longitude);
  }

  private isNewOnPlatform(joinDate: Date): boolean {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return joinDate > thirtyDaysAgo;
  }
}
