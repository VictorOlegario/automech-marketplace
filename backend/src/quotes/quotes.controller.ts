import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { QuotesService } from './quotes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../common/enums';
import { CreateQuoteDto } from './dto/create-quote.dto';

@ApiTags('quotes')
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MECHANIC)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send a quote for a service request' })
  async create(@Request() req: any, @Body() dto: CreateQuoteDto) {
    return this.quotesService.create(req.user.id, dto);
  }

  @Get('service-request/:serviceRequestId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get quotes for a service request' })
  async getByServiceRequest(@Param('serviceRequestId') serviceRequestId: string) {
    return this.quotesService.findByServiceRequest(serviceRequestId);
  }

  @Get('my-quotes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MECHANIC)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my quotes (as mechanic)' })
  async getMyQuotes(@Request() req: any) {
    return this.quotesService.findByMechanic(req.user.id);
  }

  @Put(':id/accept')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Accept a quote' })
  async accept(@Param('id') id: string, @Request() req: any) {
    return this.quotesService.acceptQuote(id, req.user.id);
  }

  @Put(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject a quote' })
  async reject(@Param('id') id: string, @Request() req: any) {
    return this.quotesService.rejectQuote(id, req.user.id);
  }
}
