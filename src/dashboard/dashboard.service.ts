import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueueStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getBarberStats(barberId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completedItems = await this.prisma.queueItem.findMany({
      where: {
        barberId,
        status: QueueStatus.DONE,
      },
      include: { service: true },
    });

    const todayItems = completedItems.filter(item => item.updatedAt >= today);

    const totalRevenue = completedItems.reduce((acc, item) => acc + Number(item.service.price), 0);
    const todayRevenue = todayItems.reduce((acc, item) => acc + Number(item.service.price), 0);

    return {
      totalServices: completedItems.length,
      todayServices: todayItems.length,
      totalRevenue,
      todayRevenue,
    };
  }

  async getAdminStats() {
    const allCompleted = await this.prisma.queueItem.findMany({
      where: { status: QueueStatus.DONE },
      include: { service: true, barber: true },
    });

    const totalRevenue = allCompleted.reduce((acc, item) => acc + Number(item.service.price), 0);
    
    // Group by Barber
    const byBarber = {};
    allCompleted.forEach(item => {
      const name = item.barber.name;
      if (!byBarber[name]) byBarber[name] = { count: 0, revenue: 0 };
      byBarber[name].count++;
      byBarber[name].revenue += Number(item.service.price);
    });

    return {
      totalServices: allCompleted.length,
      totalRevenue,
      byBarber,
    };
  }
}
