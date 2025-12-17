import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'))
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('barber')
  getBarberStats(@Request() req, @Query('days') days?: string) {
    return this.dashboardService.getBarberStats(req.user.userId, days ? +days : 0);
  }

  @Get('admin')
  getAdminStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('serviceId') serviceId?: string,
  ) {
    return this.dashboardService.getAdminStats(startDate, endDate, serviceId ? +serviceId : undefined);
  }
}
