import { Test, TestingModule } from '@nestjs/testing';
import { ProductRepository } from './product.repository';
import { PrismaService } from '../../core/config/prisma/prisma.service';
import { QueryOptimizerService } from '../../shared/services/query-optimizer.service';
import { QueryOptions } from '../../shared/types';
import { Decimal } from 'decimal.js';

// Define Product type locally since it's causing import issues
type Product = {
  id: number;
  name: string;
  description: string | null;
  price: Decimal;
  category: string;
  createdAt: Date;
  updatedAt: Date;
};

describe('ProductRepository', () => {
  let repository: ProductRepository;
  let prismaService: any;

  const mockProduct: Product = {
    id: 1,
    name: 'Test Product',
    description: 'Test Description',
    price: new Decimal(29.99),
    category: 'Electronics',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  };

  const mockProducts: Product[] = [
    mockProduct,
    {
      id: 2,
      name: 'Another Product',
      description: 'Another Description',
      price: new Decimal(49.99),
      category: 'Books',
      createdAt: new Date('2024-01-02T00:00:00Z'),
      updatedAt: new Date('2024-01-02T00:00:00Z'),
    },
    {
      id: 3,
      name: 'Third Product',
      description: 'Third Description',
      price: new Decimal(19.99),
      category: 'Electronics',
      createdAt: new Date('2024-01-03T00:00:00Z'),
      updatedAt: new Date('2024-01-03T00:00:00Z'),
    },
  ];

  beforeEach(async () => {
    const mockPrismaService = {
      product: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
    };

    const mockQueryOptimizerService = {
      executeWithMonitoring: jest.fn().mockImplementation((name, fn) => fn()),
      getOptimizedProductQuery: jest.fn().mockReturnValue({
        where: {},
        orderBy: { id: 'asc' },
        suggestedIndex: '',
        estimatedComplexity: { level: 'low', factors: [] },
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: QueryOptimizerService,
          useValue: mockQueryOptimizerService,
        },
      ],
    }).compile();

    repository = module.get<ProductRepository>(ProductRepository);
    prismaService = module.get(PrismaService);
  });

  describe('findById', () => {
    it('should return a product when found', async () => {
      prismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await repository.findById(1);

      expect(result).toEqual(mockProduct);
      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return null when product not found', async () => {
      prismaService.product.findUnique.mockResolvedValue(null);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      prismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await repository.findAll();

      expect(result).toEqual(mockProducts);
      expect(prismaService.product.findMany).toHaveBeenCalledWith();
    });
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const createData = {
        name: 'New Product',
        description: 'New Description',
        price: new Decimal(39.99),
        category: 'Clothing',
      };
      
      prismaService.product.create.mockResolvedValue({ ...mockProduct, ...createData });

      const result = await repository.create(createData);

      expect(result.name).toBe(createData.name);
      expect(prismaService.product.create).toHaveBeenCalledWith({
        data: createData,
      });
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updateData = { name: 'Updated Product' };
      const updatedProduct = { ...mockProduct, ...updateData };
      
      prismaService.product.update.mockResolvedValue(updatedProduct);

      const result = await repository.update(1, updateData);

      expect(result.name).toBe('Updated Product');
      expect(prismaService.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
    });
  });

  describe('delete', () => {
    it('should delete a product', async () => {
      prismaService.product.delete.mockResolvedValue(mockProduct);

      await repository.delete(1);

      expect(prismaService.product.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('findWithFilters', () => {
    beforeEach(() => {
      prismaService.product.findMany.mockResolvedValue(mockProducts);
      prismaService.product.count.mockResolvedValue(mockProducts.length);
    });

    it('should return paginated results with default settings', async () => {
      const options: QueryOptions = {};

      const result = await repository.findWithFilters(options);

      expect(result.data).toEqual(mockProducts);
      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.totalItems).toBe(3);
      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: [{ createdAt: 'desc' }],
        skip: 0,
        take: 10,
      });
    });

    it('should filter by category', async () => {
      const options: QueryOptions = {
        filters: { category: 'Electronics' },
      };

      await repository.findWithFilters(options);

      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: { category: 'Electronics' },
        orderBy: [{ createdAt: 'desc' }],
        skip: 0,
        take: 10,
      });
    });

    it('should filter by price range', async () => {
      const options: QueryOptions = {
        filters: { minPrice: 20, maxPrice: 40 },
      };

      await repository.findWithFilters(options);

      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: { price: { gte: 20, lte: 40 } },
        orderBy: [{ createdAt: 'desc' }],
        skip: 0,
        take: 10,
      });
    });

    it('should filter by search query', async () => {
      const options: QueryOptions = {
        filters: { search: 'test' },
      };

      await repository.findWithFilters(options);

      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'test', mode: 'insensitive' } },
            { description: { contains: 'test', mode: 'insensitive' } },
          ],
        },
        orderBy: [{ createdAt: 'desc' }],
        skip: 0,
        take: 10,
      });
    });

    it('should sort by specified field', async () => {
      const options: QueryOptions = {
        sort: { field: 'price', order: 'asc' },
      };

      await repository.findWithFilters(options);

      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: [{ price: 'asc' }],
        skip: 0,
        take: 10,
      });
    });

    it('should handle pagination', async () => {
      const options: QueryOptions = {
        pagination: { page: 2, limit: 5 },
      };

      await repository.findWithFilters(options);

      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: [{ createdAt: 'desc' }],
        skip: 5,
        take: 5,
      });
    });

    it('should combine filters, sorting, and pagination', async () => {
      const options: QueryOptions = {
        filters: { category: 'Electronics', minPrice: 20 },
        sort: { field: 'name', order: 'asc' },
        pagination: { page: 2, limit: 5 },
      };

      await repository.findWithFilters(options);

      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: { 
          category: 'Electronics',
          price: { gte: 20 }
        },
        orderBy: [{ name: 'asc' }],
        skip: 5,
        take: 5,
      });
    });

    it('should calculate pagination metadata correctly', async () => {
      prismaService.product.count.mockResolvedValue(25);
      
      const options: QueryOptions = {
        pagination: { page: 3, limit: 10 },
      };

      const result = await repository.findWithFilters(options);

      expect(result.pagination).toEqual({
        currentPage: 3,
        totalPages: 3,
        totalItems: 25,
        itemsPerPage: 10,
        hasNext: false,
        hasPrev: true,
      });
    });
  });

  describe('search', () => {
    it('should search across specified fields', async () => {
      prismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await repository.search('test', ['name', 'description']);

      expect(result).toEqual(mockProducts);
      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'test', mode: 'insensitive' } },
            { description: { contains: 'test', mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array for invalid fields', async () => {
      const result = await repository.search('test', ['invalidField']);

      expect(result).toEqual([]);
      expect(prismaService.product.findMany).not.toHaveBeenCalled();
    });

    it('should handle single field search', async () => {
      prismaService.product.findMany.mockResolvedValue([mockProduct]);

      await repository.search('electronics', ['category']);

      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { category: { contains: 'electronics', mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('countTotal', () => {
    it('should return total count without filters', async () => {
      prismaService.product.count.mockResolvedValue(10);

      const result = await repository.countTotal();

      expect(result).toBe(10);
      expect(prismaService.product.count).toHaveBeenCalledWith();
    });

    it('should return filtered count with category filter', async () => {
      prismaService.product.count.mockResolvedValue(5);

      const result = await repository.countTotal({ category: 'Electronics' });

      expect(result).toBe(5);
      expect(prismaService.product.count).toHaveBeenCalledWith({
        where: { category: 'Electronics' },
      });
    });

    it('should return filtered count with price range', async () => {
      prismaService.product.count.mockResolvedValue(3);

      const result = await repository.countTotal({ minPrice: 20, maxPrice: 50 });

      expect(result).toBe(3);
      expect(prismaService.product.count).toHaveBeenCalledWith({
        where: { price: { gte: 20, lte: 50 } },
      });
    });

    it('should return filtered count with search query', async () => {
      prismaService.product.count.mockResolvedValue(2);

      const result = await repository.countTotal({ search: 'test' });

      expect(result).toBe(2);
      expect(prismaService.product.count).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'test', mode: 'insensitive' } },
            { description: { contains: 'test', mode: 'insensitive' } },
          ],
        },
      });
    });
  });

  describe('findByCategory', () => {
    it('should find products by category', async () => {
      const electronicsProducts = mockProducts.filter(p => p.category === 'Electronics');
      prismaService.product.findMany.mockResolvedValue(electronicsProducts);

      const result = await repository.findByCategory('Electronics');

      expect(result).toEqual(electronicsProducts);
      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: { category: 'Electronics' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findByPriceRange', () => {
    it('should find products by price range', async () => {
      prismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await repository.findByPriceRange(20, 50);

      expect(result).toEqual(mockProducts);
      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          price: {
            gte: 20,
            lte: 50,
          },
        },
        orderBy: { price: 'asc' },
      });
    });
  });

  describe('getCategories', () => {
    it('should return distinct categories', async () => {
      const mockCategoryResult = [
        { category: 'Books' },
        { category: 'Electronics' },
      ];
      prismaService.product.findMany.mockResolvedValue(mockCategoryResult);

      const result = await repository.getCategories();

      expect(result).toEqual(['Books', 'Electronics']);
      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        select: { category: true },
        distinct: ['category'],
        orderBy: { category: 'asc' },
      });
    });
  });
});