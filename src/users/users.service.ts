import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        isActive: true,
        isOnline: true,
        createdAt: true,
      },
    });
  }

  findBarbers() {
    return this.prisma.user.findMany({
      where: { role: 'BARBER', isActive: true },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        isActive: true,
        isOnline: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async toggleOnline(id: number) {
    const user = await this.findOne(id);
    if (!user) throw new Error('User not found');
    return this.prisma.user.update({
      where: { id },
      data: { isOnline: !user.isOnline },
    });
  }

  async remove(id: number) {
    try {
      return await this.prisma.user.delete({
        where: { id },
      });
    } catch (error: any) {
      // P2003: Foreign key constraint failed
      if (error.code === 'P2003' || error.message?.includes('Foreign key') || error.toString().includes('Foreign key')) {
        return this.prisma.user.update({
          where: { id },
          data: { isActive: false },
        });
      }
      throw error;
    }
  }
}
