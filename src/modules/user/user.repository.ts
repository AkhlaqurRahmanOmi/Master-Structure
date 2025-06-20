
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/config/prisma/prisma.service';
import { BaseRepository } from '../../shared/repositories/base.repository';
import { User } from '@prisma/client';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(private prisma: PrismaService) {
    super();
  }

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async create(data: Omit<User, 'id'>): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}