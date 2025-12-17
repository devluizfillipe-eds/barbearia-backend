import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  create(createServiceDto: CreateServiceDto) {
    return this.prisma.service.create({
      data: createServiceDto,
    });
  }

  findAll() {
    return this.prisma.service.findMany({
      where: { isActive: true },
    });
  }

  findAllAdmin() {
    return this.prisma.service.findMany();
  }

  findOne(id: number) {
    return this.prisma.service.findUnique({
      where: { id },
    });
  }

  update(id: number, updateServiceDto: UpdateServiceDto) {
    return this.prisma.service.update({
      where: { id },
      data: updateServiceDto,
    });
  }

  async remove(id: number) {
    try {
      return await this.prisma.service.delete({
        where: { id },
      });
    } catch (error: any) {
      console.log('Error deleting service:', error);
      // P2003: Foreign key constraint failed
      if (error.code === 'P2003' || error.message?.includes('Foreign key') || error.toString().includes('Foreign key')) {
        return this.prisma.service.update({
          where: { id },
          data: { isActive: false },
        });
      }
      throw error;
    }
  }
}
