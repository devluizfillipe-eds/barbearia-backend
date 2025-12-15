import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JoinQueueDto } from './dto/join-queue.dto';
import { UpdateQueueItemDto } from './dto/update-queue-item.dto';
import { QueueStatus } from '@prisma/client';

@Injectable()
export class QueueService {
  constructor(private prisma: PrismaService) {}

  async join(joinQueueDto: JoinQueueDto) {
    return this.prisma.queueItem.create({
      data: {
        clientName: joinQueueDto.clientName,
        clientPhone: joinQueueDto.clientPhone,
        barber: { connect: { id: joinQueueDto.barberId } },
        service: { connect: { id: joinQueueDto.serviceId } },
        status: QueueStatus.WAITING,
      },
    });
  }

  async getBarberQueue(barberId: number) {
    return this.prisma.queueItem.findMany({
      where: {
        barberId,
        status: { in: [QueueStatus.WAITING, QueueStatus.IN_PROGRESS] },
      },
      orderBy: { createdAt: 'asc' },
      include: { service: true },
    });
  }

  async getClientStatus(id: number) {
    const item = await this.prisma.queueItem.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException('Queue item not found');

    const peopleAhead = await this.prisma.queueItem.count({
      where: {
        barberId: item.barberId,
        status: QueueStatus.WAITING,
        createdAt: { lt: item.createdAt },
      },
    });

    return { ...item, peopleAhead };
  }

  async updateStatus(id: number, updateQueueItemDto: UpdateQueueItemDto) {
    const data: any = { status: updateQueueItemDto.status };
    
    if (updateQueueItemDto.status === QueueStatus.IN_PROGRESS) {
      data.startTime = new Date();
    } else if (updateQueueItemDto.status === QueueStatus.DONE) {
      data.endTime = new Date();
    }

    return this.prisma.queueItem.update({
      where: { id },
      data,
    });
  }
}
