import { IsEnum } from 'class-validator';
import { QueueStatus } from '@prisma/client';

export class UpdateQueueItemDto {
  @IsEnum(QueueStatus)
  status: QueueStatus;
}
