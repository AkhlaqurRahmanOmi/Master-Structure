import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/config/prisma/prisma.service';
import { BaseRepository } from '../../shared/repositories/base.repository';
import { Product, Prisma } from '@prisma/client';
import { FilterOptions, PaginatedResult, QueryOptions } from '../../shared/types';
import { QueryOptimizerService, ProductQueryFilters } from '../../shared/services/query-optimizer.service';
import { PerformanceMonitor } from '../../shared/decorators/performance-monitor.decorator';

@Injectable()
export class ProductRepository extends BaseRepository<Product, number> {
  constructor(
    private prisma: PrismaService,
    private queryOptimizer: QueryOptimizerService,
  ) {
    super();
  }

  @PerformanceMonitor('ProductRepository.findById')
  async findById(id: number): Promise<Product | null> {
    return this.queryOptimizer.executeWithMonitoring(
      'product_find_by_id',
      () => this.prisma.product.findUnique({
        where: { id },
      }),
      { productId: id }
    );
  }

  @PerformanceMonitor('ProductRepository.findAll')
  async findAll(): Promise<Product[]> {
    return this.queryOptimizer.executeWithMonitoring(
      'product_find_all',
      () => this.prisma.product.findMany({
        orderBy: { id: 'asc' }, // Consistent ordering for performance
      })
    );
  }

  @PerformanceMonitor('ProductRepository.create')
  async create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    return this.queryOptimizer.executeWithMonitoring(
      'product_create',
      () => this.prisma.product.create({
        data,
      }),
      { productName: data.name, category: data.category }
    );
  }

  @PerformanceMonitor('ProductRepository.update')
  async update(id: number, data: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Product> {
    return this.queryOptimizer.executeWithMonitoring(
      'product_update',
      () => this.prisma.product.update({
        where: { id },
        data,
      }),
      { productId: id, updatedFields: Object.keys(data) }
    );
  }

  @PerformanceMonitor('ProductRepository.delete')
  async delete(id: number): Promise<void> {
    await this.queryOptimizer.executeWithMonitoring(
      'product_delete',
      () => this.prisma.product.delete({
        where: { id },
      }),
      { productId: id }
    );
  }

  @PerformanceMonitor('ProductRepository.findWithFilters')
  async findWithFilters(options: QueryOptions): Promise<PaginatedResult<Product>> {
    const { filters, sort, pagination } = options;
    
    // Convert to ProductQueryFilters for optimization
    const queryFilters: ProductQueryFilters = {
      category: filters?.category,
      minPrice: filters?.minPrice,
      maxPrice: filters?.maxPrice,
      name: filters?.name,
      search: filters?.search,
      sortBy: sort?.field,
      sortOrder: sort?.order,
    };

    // Get optimized query from query optimizer
    const optimizedQuery = this.queryOptimizer.getOptimizedProductQuery(queryFilters);
    
    // Pagination settings
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    // Execute queries with monitoring
    return this.queryOptimizer.executeWithMonitoring(
      'product_find_with_filters',
      async () => {
        const [products, totalItems] = await Promise.all([
          this.prisma.product.findMany({
            where: optimizedQuery.where,
            orderBy: optimizedQuery.orderBy,
            skip,
            take: limit,
          }),
          this.prisma.product.count({ where: optimizedQuery.where }),
        ]);

        const totalPages = Math.ceil(totalItems / limit);

        return {
          data: products,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems,
            itemsPerPage: limit,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        };
      },
      {
        filters: queryFilters,
        pagination: { page, limit },
        suggestedIndex: optimizedQuery.suggestedIndex,
        queryComplexity: optimizedQuery.estimatedComplexity,
      }
    );
  }

  @PerformanceMonitor('ProductRepository.search')
  async search(query: string, fields: string[]): Promise<Product[]> {
    return this.queryOptimizer.executeWithMonitoring(
      'product_search',
      async () => {
        const searchConditions: Prisma.ProductWhereInput[] = [];
        
        fields.forEach(field => {
          if (field === 'name' || field === 'description' || field === 'category') {
            searchConditions.push({
              [field]: {
                contains: query,
                mode: 'insensitive',
              },
            });
          }
        });

        if (searchConditions.length === 0) {
          return [];
        }

        return this.prisma.product.findMany({
          where: {
            OR: searchConditions,
          },
          orderBy: { createdAt: 'desc' },
        });
      },
      { query, fields, searchFieldsCount: fields.length }
    );
  }

  @PerformanceMonitor('ProductRepository.countTotal')
  async countTotal(filters?: FilterOptions): Promise<number> {
    return this.queryOptimizer.executeWithMonitoring(
      'product_count_total',
      async () => {
        if (!filters) {
          return this.prisma.product.count();
        }

        const where: Prisma.ProductWhereInput = {};
        
        // Category filter
        if (filters.category) {
          where.category = filters.category;
        }
        
        // Price range filters
        if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
          where.price = {};
          if (filters.minPrice !== undefined) {
            where.price.gte = filters.minPrice;
          }
          if (filters.maxPrice !== undefined) {
            where.price.lte = filters.maxPrice;
          }
        }
        
        // Text search across name and description
        if (filters.search) {
          where.OR = [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
          ];
        }
        
        // Name filter (exact match)
        if (filters.name) {
          where.name = { contains: filters.name, mode: 'insensitive' };
        }

        return this.prisma.product.count({ where });
      },
      { hasFilters: !!filters, filterCount: filters ? Object.keys(filters).length : 0 }
    );
  }

  // Additional helper methods for specific product operations
  @PerformanceMonitor('ProductRepository.findByCategory')
  async findByCategory(category: string): Promise<Product[]> {
    return this.queryOptimizer.executeWithMonitoring(
      'product_find_by_category',
      () => this.prisma.product.findMany({
        where: { category },
        orderBy: { createdAt: 'desc' },
      }),
      { category }
    );
  }

  @PerformanceMonitor('ProductRepository.findByPriceRange')
  async findByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]> {
    return this.queryOptimizer.executeWithMonitoring(
      'product_find_by_price_range',
      () => this.prisma.product.findMany({
        where: {
          price: {
            gte: minPrice,
            lte: maxPrice,
          },
        },
        orderBy: { price: 'asc' },
      }),
      { minPrice, maxPrice, priceRange: maxPrice - minPrice }
    );
  }

  @PerformanceMonitor('ProductRepository.getCategories')
  async getCategories(): Promise<string[]> {
    return this.queryOptimizer.executeWithMonitoring(
      'product_get_categories',
      async () => {
        const result = await this.prisma.product.findMany({
          select: { category: true },
          distinct: ['category'],
          orderBy: { category: 'asc' },
        });
        
        return result.map(item => item.category);
      }
    );
  }
}