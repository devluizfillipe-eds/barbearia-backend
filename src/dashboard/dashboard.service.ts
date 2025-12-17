import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueueStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getBarberStats(barberId: number, days: number = 0) {
    const now = new Date();
    let startDate = new Date();
    
    if (days > 0) {
      startDate.setDate(now.getDate() - days);
      startDate.setHours(0, 0, 0, 0);
    } else {
      // Default to today
      startDate.setHours(0, 0, 0, 0);
    }

    const completedItems = await this.prisma.queueItem.findMany({
      where: {
        barberId,
        status: QueueStatus.DONE,
        updatedAt: {
          gte: startDate,
        },
      },
      include: { service: true },
      orderBy: { updatedAt: 'asc' },
    });

    const totalRevenue = completedItems.reduce((acc, item) => acc + Number(item.service.price), 0);
    const totalServices = completedItems.length;
    const averageTicket = totalServices > 0 ? totalRevenue / totalServices : 0;

    // Daily History
    const dailyHistoryMap = new Map<string, { date: string, revenue: number, count: number }>();
    
    // Initialize days if filtering by range (optional, but good for charts)
    if (days > 0) {
      for (let i = 0; i <= days; i++) {
        const d = new Date();
        d.setDate(now.getDate() - (days - i));
        const dateStr = d.toLocaleDateString('pt-BR'); // DD/MM/YYYY
        dailyHistoryMap.set(dateStr, { date: dateStr, revenue: 0, count: 0 });
      }
    }

    completedItems.forEach(item => {
      const dateStr = new Date(item.updatedAt).toLocaleDateString('pt-BR');
      if (!dailyHistoryMap.has(dateStr)) {
        dailyHistoryMap.set(dateStr, { date: dateStr, revenue: 0, count: 0 });
      }
      const entry = dailyHistoryMap.get(dateStr)!;
      entry.revenue += Number(item.service.price);
      entry.count += 1;
    });

    const dailyHistory = Array.from(dailyHistoryMap.values());

    // Service Breakdown
    const serviceBreakdownMap = new Map<string, { name: string, count: number, revenue: number }>();
    completedItems.forEach(item => {
      const name = item.service.name;
      if (!serviceBreakdownMap.has(name)) {
        serviceBreakdownMap.set(name, { name, count: 0, revenue: 0 });
      }
      const entry = serviceBreakdownMap.get(name)!;
      entry.count += 1;
      entry.revenue += Number(item.service.price);
    });

    const serviceBreakdown = Array.from(serviceBreakdownMap.values());

    return {
      summary: {
        totalServices,
        totalRevenue,
        averageTicket,
      },
      dailyHistory,
      serviceBreakdown,
    };
  }

  async getAdminStats(startDateStr?: string, endDateStr?: string, serviceId?: number) {
    const whereClause: any = {
      status: QueueStatus.DONE,
    };

    if (startDateStr || endDateStr) {
      whereClause.updatedAt = {};
      if (startDateStr) {
        whereClause.updatedAt.gte = new Date(startDateStr);
      }
      if (endDateStr) {
        // Adjust end date to include the full day
        const end = new Date(endDateStr);
        end.setHours(23, 59, 59, 999);
        whereClause.updatedAt.lte = end;
      }
    }

    if (serviceId) {
      whereClause.serviceId = serviceId;
    }

    const allCompleted = await this.prisma.queueItem.findMany({
      where: whereClause,
      include: { service: true, barber: true },
      orderBy: { updatedAt: 'asc' },
    });

    const totalRevenue = allCompleted.reduce((acc, item) => acc + Number(item.service.price), 0);
    const totalServices = allCompleted.length;
    const averageTicket = totalServices > 0 ? totalRevenue / totalServices : 0;
    
    // Group by Barber
    const byBarberMap = new Map<string, { name: string, count: number, revenue: number }>();
    
    // Group by Service
    const byServiceMap = new Map<string, { name: string, count: number, revenue: number }>();

    // Daily History
    const dailyHistoryMap = new Map<string, { date: string, revenue: number, count: number }>();

    allCompleted.forEach(item => {
      // Barber Stats
      const barberName = item.barber.name;
      if (!byBarberMap.has(barberName)) {
        byBarberMap.set(barberName, { name: barberName, count: 0, revenue: 0 });
      }
      const barberEntry = byBarberMap.get(barberName)!;
      barberEntry.count++;
      barberEntry.revenue += Number(item.service.price);

      // Service Stats
      const serviceName = item.service.name;
      if (!byServiceMap.has(serviceName)) {
        byServiceMap.set(serviceName, { name: serviceName, count: 0, revenue: 0 });
      }
      const serviceEntry = byServiceMap.get(serviceName)!;
      serviceEntry.count++;
      serviceEntry.revenue += Number(item.service.price);

      // Daily Stats
      const dateStr = new Date(item.updatedAt).toLocaleDateString('pt-BR');
      if (!dailyHistoryMap.has(dateStr)) {
        dailyHistoryMap.set(dateStr, { date: dateStr, revenue: 0, count: 0 });
      }
      const dailyEntry = dailyHistoryMap.get(dateStr)!;
      dailyEntry.count++;
      dailyEntry.revenue += Number(item.service.price);
    });

    return {
      summary: {
        totalServices,
        totalRevenue,
        averageTicket,
      },
      byBarber: Array.from(byBarberMap.values()),
      byService: Array.from(byServiceMap.values()),
      dailyHistory: Array.from(dailyHistoryMap.values()),
    };
  }
}
