import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'))
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('barber')
  getBarberStats(@Request() req) {
    return this.dashboardService.getBarberStats(req.user.userId);
  }

  @Get('admin')
  getAdminStats() {
    // In a real app, check if user is admin
    return this.dashboardService.getAdminStats();
  }
}
