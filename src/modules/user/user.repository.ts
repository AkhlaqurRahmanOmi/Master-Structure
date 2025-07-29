
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/config/prisma/prisma.service';
import { BaseRepository } from '../../shared/repositories/base.repository';
import { User, Prisma } from '@prisma/client';
import { FilterOptions, PaginatedResult, QueryOptions } from '../../shared/types';

@Injectable()
export class UserRepository extends BaseRepository<User, number> {
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

  async findWithFilters(options: QueryOptions): Promise<PaginatedResult<User>> {
    const { filters, sort, pagination } = options;
    
    // Build where clause from filters
    const where: Prisma.UserWhereInput = {};
    
    if (filters) {
      // Email filter (partial match, case-insensitive)
      if (filters.email) {
        where.email = { contains: filters.email, mode: 'insensitive' };
      }
      
      // Text search across email field
      if (filters.search) {
        where.email = { contains: filters.search, mode: 'insensitive' };
      }
    }

    // Build orderBy clause from sort options
    const orderBy: Prisma.UserOrderByWithRelationInput[] = [];
    if (sort) {
      orderBy.push({ [sort.field]: sort.order });
    } else {
      // Default sorting by id desc
      orderBy.push({ id: 'desc' });
    }

    // Pagination settings
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    // Execute queries
    const [users, totalItems] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: users,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async search(query: string, fields: string[]): Promise<User[]> {
    const searchConditions: Prisma.UserWhereInput[] = [];
    
    fields.forEach(field => {
      if (field === 'email') {
        searchConditions.push({
          email: {
            contains: query,
            mode: 'insensitive',
          },
        });
      }
    });

    if (searchConditions.length === 0) {
      return [];
    }

    return this.prisma.user.findMany({
      where: {
        OR: searchConditions,
      },
      orderBy: { id: 'desc' },
    });
  }

  async countTotal(filters?: FilterOptions): Promise<number> {
    if (!filters) {
      return this.prisma.user.count();
    }

    const where: Prisma.UserWhereInput = {};
    
    // Email filter
    if (filters.email) {
      where.email = { contains: filters.email, mode: 'insensitive' };
    }
    
    // Text search across email field
    if (filters.search) {
      where.email = { contains: filters.search, mode: 'insensitive' };
    }

    return this.prisma.user.count({ where });
  }
}