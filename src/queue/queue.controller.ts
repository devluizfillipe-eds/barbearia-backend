import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { QueueService } from './queue.service';
import { JoinQueueDto } from './dto/join-queue.dto';
import { UpdateQueueItemDto } from './dto/update-queue-item.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post()
  join(@Body() joinQueueDto: JoinQueueDto) {
    return this.queueService.join(joinQueueDto);
  }

  @Get('status/:id')
  getStatus(@Param('id') id: string) {
    return this.queueService.getClientStatus(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('barber')
  getMyQueue(@Request() req) {
    return this.queueService.getBarberQueue(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  updateStatus(@Param('id') id: string, @Body() updateQueueItemDto: UpdateQueueItemDto) {
    return this.queueService.updateStatus(+id, updateQueueItemDto);
  }
}
