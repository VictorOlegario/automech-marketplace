import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ServiceRequestsService } from './service-requests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../common/enums';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { UpdateServiceStatusDto } from './dto/update-service-status.dto';

@ApiTags('service-requests')
@Controller('service-requests')
export class ServiceRequestsController {
  constructor(private readonly serviceRequestsService: ServiceRequestsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new service request' })
  async create(@Request() req: any, @Body() dto: CreateServiceRequestDto) {
    return this.serviceRequestsService.create(req.user.id, dto);
  }

  @Get('my-requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my service requests (as client)' })
  async getMyRequests(@Request() req: any) {
    return this.serviceRequestsService.findByCustomer(req.user.id);
  }

  @Get('my-jobs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MECHANIC)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my assigned jobs (as mechanic)' })
  async getMyJobs(@Request() req: any) {
    return this.serviceRequestsService.findByMechanic(req.user.id);
  }

  @Get('available')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MECHANIC)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find available service requests nearby' })
  @ApiQuery({ name: 'latitude', type: Number, required: true })
  @ApiQuery({ name: 'longitude', type: Number, required: true })
  @ApiQuery({ name: 'radius', type: Number, required: false })
  async findAvailable(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radius') radius?: number,
  ) {
    return this.serviceRequestsService.findAvailableRequests(
      Number(latitude),
      Number(longitude),
      radius ? Number(radius) : 20,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get service request by ID' })
  async getById(@Param('id') id: string) {
    return this.serviceRequestsService.findById(id);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update service request status' })
  async updateStatus(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: UpdateServiceStatusDto,
  ) {
    return this.serviceRequestsService.updateStatus(id, req.user.id, dto);
  }
}
