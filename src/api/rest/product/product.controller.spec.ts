import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from '../../../modules/product/product.service';
import { CacheInterceptor } from '../../../shared/interceptors/cache.interceptor';
import { Decimal } from '@prisma/client/runtime/library';

describe('ProductController', () => {
  let controller: ProductController;
  let mockProductService: jest.Mocked<ProductService>;

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      search: jest.fn(),
      findByCategory: jest.fn(),
      findByPriceRange: jest.fn(),
      getCategories: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockService,
        },
      ],
    })
      .overrideInterceptor(CacheInterceptor)
      .useValue({
        intercept: jest.fn((context, next) => next.handle()),
      })
      .compile();

    controller = module.get<ProductController>(ProductController);
    mockProductService = module.get(ProductService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a product', async () => {
      const createDto = {
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        category: 'electronics',
      };

      const mockRequest = {
        protocol: 'http',
        get: jest.fn().mockReturnValue('localhost:3000'),
      } as any;

      const expectedResponse = {
        success: true as const,
        statusCode: 201,
        message: 'Product created successfully',
        data: { 
          id: 1, 
          name: createDto.name,
          description: createDto.description,
          price: new Decimal(createDto.price),
          category: createDto.category,
          createdAt: new Date(), 
          updatedAt: new Date() 
        },
        meta: { timestamp: '2023-01-01T00:00:00.000Z', traceId: 'test-trace', version: '1.0.0' },
        links: { self: 'http://localhost:3000/api/v1/products/1' },
      };

      mockProductService.create.mockResolvedValue(expectedResponse);

      const result = await controller.create(createDto, mockRequest);

      expect(mockProductService.create).toHaveBeenCalledWith(createDto, 'http://localhost:3000');
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      const queryParams = { page: 1, limit: 10 };
      const mockRequest = {
        protocol: 'http',
        get: jest.fn().mockReturnValue('localhost:3000'),
      } as any;

      const expectedResponse = {
        success: true as const,
        statusCode: 200,
        message: 'Products retrieved successfully',
        data: [],
        meta: { timestamp: '2023-01-01T00:00:00.000Z', traceId: 'test-trace', version: '1.0.0' },
        links: { self: 'http://localhost:3000/api/v1/products' },
      };

      mockProductService.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll(queryParams, mockRequest);

      expect(mockProductService.findAll).toHaveBeenCalledWith(queryParams, 'http://localhost:3000');
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findOne', () => {
    it('should return a single product', async () => {
      const productId = 1;
      const mockRequest = {
        protocol: 'http',
        get: jest.fn().mockReturnValue('localhost:3000'),
      } as any;

      const expectedResponse = {
        success: true as const,
        statusCode: 200,
        message: 'Product retrieved successfully',
        data: { 
          id: productId, 
          name: 'Test Product',
          description: null,
          price: new Decimal(99.99),
          category: 'electronics',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        meta: { timestamp: '2023-01-01T00:00:00.000Z', traceId: 'test-trace', version: '1.0.0' },
        links: { self: `http://localhost:3000/api/v1/products/${productId}` },
      };

      mockProductService.findOne.mockResolvedValue(expectedResponse);

      const result = await controller.findOne(productId, mockRequest);

      expect(mockProductService.findOne).toHaveBeenCalledWith(productId, 'http://localhost:3000');
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const productId = 1;
      const updateDto = { name: 'Updated Product' };
      const mockRequest = {
        protocol: 'http',
        get: jest.fn().mockReturnValue('localhost:3000'),
      } as any;

      const expectedResponse = {
        success: true as const,
        statusCode: 200,
        message: 'Product updated successfully',
        data: { 
          id: productId, 
          name: updateDto.name || 'Test Product',
          description: null,
          price: new Decimal(99.99),
          category: 'electronics',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        meta: { timestamp: '2023-01-01T00:00:00.000Z', traceId: 'test-trace', version: '1.0.0' },
        links: { self: `http://localhost:3000/api/v1/products/${productId}` },
      };

      mockProductService.update.mockResolvedValue(expectedResponse);

      const result = await controller.update(productId, updateDto, mockRequest);

      expect(mockProductService.update).toHaveBeenCalledWith(productId, updateDto, 'http://localhost:3000');
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      const productId = 1;
      const mockRequest = {
        protocol: 'http',
        get: jest.fn().mockReturnValue('localhost:3000'),
      } as any;

      const expectedResponse = {
        success: true as const,
        statusCode: 200,
        message: 'Product deleted successfully',
        data: null,
        meta: { timestamp: '2023-01-01T00:00:00.000Z', traceId: 'test-trace', version: '1.0.0' },
        links: { self: 'http://localhost:3000/api/v1/products' },
      };

      mockProductService.remove.mockResolvedValue(expectedResponse);

      const result = await controller.remove(productId, mockRequest);

      expect(mockProductService.remove).toHaveBeenCalledWith(productId, 'http://localhost:3000');
      expect(result).toEqual(expectedResponse);
    });
  });
});