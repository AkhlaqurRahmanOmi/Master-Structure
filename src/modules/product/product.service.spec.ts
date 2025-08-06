import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductServiceDto, UpdateProductServiceDto } from './dto';
import { ProductRepository } from './product.repository';
import { ResponseBuilderService } from '../../shared/services/response-builder.service';
import { TraceIdService } from '../../shared/services/trace-id.service';
import { PubsubService } from '../../shared/pubsub/pubsub.service';
import { ValidationException } from '../../shared/exceptions/validation.exception';
import { Product } from '@prisma/client';

// Mock Product type for testing
const mockProduct: Product = {
  id: 1,
  name: 'Test Product',
  description: 'Test Description',
  price: 99.99 as any, // Using 'as any' to handle Decimal type in tests
  category: 'Electronics',
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-01T00:00:00Z'),
};

const mockPaginatedResult = {
  data: [mockProduct],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 1,
    itemsPerPage: 10,
    hasNext: false,
    hasPrev: false,
  },
};

const mockApiResponse = {
  success: true,
  statusCode: 200,
  message: 'Success',
  data: mockProduct,
  meta: {
    timestamp: '2025-01-01T00:00:00Z',
    traceId: 'test-trace-id',
    version: '1.0.0',
  },
  links: {
    self: '/api/products/1',
  },
};

describe('ProductService', () => {
  let service: ProductService;
  let productRepository: jest.Mocked<ProductRepository>;
  let responseBuilder: jest.Mocked<ResponseBuilderService>;
  let traceIdService: jest.Mocked<TraceIdService>;
  let pubsubService: jest.Mocked<PubsubService>;

  beforeEach(async () => {
    const mockProductRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findWithFilters: jest.fn(),
      search: jest.fn(),
      findByCategory: jest.fn(),
      findByPriceRange: jest.fn(),
      getCategories: jest.fn(),
      countTotal: jest.fn(),
    };

    const mockResponseBuilder = {
      buildSuccessResponse: jest.fn(),
      buildErrorResponse: jest.fn(),
      generateHATEOASLinks: jest.fn(),
    };

    const mockTraceIdService = {
      getTraceId: jest.fn(),
      setTraceId: jest.fn(),
    };

    const mockPubsubService = {
      publish: jest.fn(),
      asyncIterator: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: ProductRepository, useValue: mockProductRepository },
        { provide: ResponseBuilderService, useValue: mockResponseBuilder },
        { provide: TraceIdService, useValue: mockTraceIdService },
        { provide: 'PUB_SUB', useValue: mockPubsubService },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    productRepository = module.get(ProductRepository);
    responseBuilder = module.get(ResponseBuilderService);
    traceIdService = module.get(TraceIdService);
    pubsubService = module.get('PUB_SUB');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createProductDto: CreateProductServiceDto = {
      name: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      category: 'Electronics',
    };

    it('should create a product successfully', async () => {
      // Arrange
      traceIdService.getTraceId.mockReturnValue('test-trace-id');
      productRepository.search.mockResolvedValue([]);
      productRepository.create.mockResolvedValue(mockProduct);
      responseBuilder.generateHATEOASLinks.mockReturnValue({ self: '/api/products/1' });
      responseBuilder.buildSuccessResponse.mockReturnValue(mockApiResponse as any);
      pubsubService.publish.mockResolvedValue();

      // Act
      const result = await service.create(createProductDto, '/api/products');

      // Assert
      expect(productRepository.search).toHaveBeenCalledWith('Test Product', ['name']);
      expect(productRepository.create).toHaveBeenCalledWith(createProductDto);
      expect(pubsubService.publish).toHaveBeenCalledWith('productCreated', mockProduct);
      expect(responseBuilder.buildSuccessResponse).toHaveBeenCalledWith(
        mockProduct,
        'Product created successfully',
        201,
        'test-trace-id',
        { self: '/api/products/1' }
      );
      expect(result).toEqual(mockApiResponse);
    });

    it('should throw ValidationException when product name already exists', async () => {
      // Arrange
      traceIdService.getTraceId.mockReturnValue('test-trace-id');
      productRepository.search.mockResolvedValue([mockProduct]);

      // Act & Assert
      await expect(service.create(createProductDto, '/api/products')).rejects.toThrow(ValidationException);
      expect(productRepository.create).not.toHaveBeenCalled();
      expect(pubsubService.publish).not.toHaveBeenCalled();
    });

    it('should throw ValidationException for invalid input', async () => {
      // Arrange
      const invalidDto = { ...createProductDto, name: '' };

      // Act & Assert
      await expect(service.create(invalidDto, '/api/products')).rejects.toThrow(ValidationException);
      expect(productRepository.create).not.toHaveBeenCalled();
      expect(pubsubService.publish).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated products successfully', async () => {
      // Arrange
      traceIdService.getTraceId.mockReturnValue('test-trace-id');
      productRepository.findWithFilters.mockResolvedValue(mockPaginatedResult);
      responseBuilder.generateHATEOASLinks.mockReturnValue({ self: '/api/products' });
      responseBuilder.buildSuccessResponse.mockReturnValue({
        ...mockApiResponse,
        data: [mockProduct],
      } as any);

      // Act
      const result = await service.findAll({}, '/api/products');

      // Assert
      expect(productRepository.findWithFilters).toHaveBeenCalled();
      expect(responseBuilder.buildSuccessResponse).toHaveBeenCalledWith(
        [mockProduct],
        'Products retrieved successfully',
        200,
        'test-trace-id',
        { self: '/api/products' },
        mockPaginatedResult.pagination
      );
      expect(result.data).toEqual([mockProduct]);
    });
  });

  describe('findOne', () => {
    it('should return a product successfully', async () => {
      // Arrange
      traceIdService.getTraceId.mockReturnValue('test-trace-id');
      productRepository.findById.mockResolvedValue(mockProduct);
      responseBuilder.generateHATEOASLinks.mockReturnValue({ self: '/api/products/1' });
      responseBuilder.buildSuccessResponse.mockReturnValue(mockApiResponse as any);

      // Act
      const result = await service.findOne(1, '/api/products');

      // Assert
      expect(productRepository.findById).toHaveBeenCalledWith(1);
      expect(responseBuilder.buildSuccessResponse).toHaveBeenCalledWith(
        mockProduct,
        'Product retrieved successfully',
        200,
        'test-trace-id',
        { self: '/api/products/1' }
      );
      expect(result).toEqual(mockApiResponse);
    });

    it('should throw NotFoundException when product not found', async () => {
      // Arrange
      traceIdService.getTraceId.mockReturnValue('test-trace-id');
      productRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(1, '/api/products')).rejects.toThrow(NotFoundException);
    });

    it('should throw ValidationException for invalid ID', async () => {
      // Act & Assert
      await expect(service.findOne(0, '/api/products')).rejects.toThrow(ValidationException);
      await expect(service.findOne(-1, '/api/products')).rejects.toThrow(ValidationException);
    });
  });

  describe('update', () => {
    const updateProductDto: UpdateProductServiceDto = {
      name: 'Updated Product',
      price: 149.99,
    };

    it('should update a product successfully', async () => {
      // Arrange
      traceIdService.getTraceId.mockReturnValue('test-trace-id');
      productRepository.findById.mockResolvedValue(mockProduct);
      productRepository.search.mockResolvedValue([]);
      const updatedProduct = { ...mockProduct, name: updateProductDto.name || mockProduct.name, price: updateProductDto.price as any || mockProduct.price };
      productRepository.update.mockResolvedValue(updatedProduct);
      responseBuilder.generateHATEOASLinks.mockReturnValue({ self: '/api/products/1' });
      responseBuilder.buildSuccessResponse.mockReturnValue(mockApiResponse as any);
      pubsubService.publish.mockResolvedValue();

      // Act
      const result = await service.update(1, updateProductDto, '/api/products');

      // Assert
      expect(productRepository.findById).toHaveBeenCalledWith(1);
      expect(productRepository.update).toHaveBeenCalledWith(1, updateProductDto);
      expect(pubsubService.publish).toHaveBeenCalledWith('productUpdated', updatedProduct);
      expect(result).toEqual(mockApiResponse);
    });

    it('should throw NotFoundException when product not found', async () => {
      // Arrange
      traceIdService.getTraceId.mockReturnValue('test-trace-id');
      productRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(1, updateProductDto, '/api/products')).rejects.toThrow(NotFoundException);
      expect(pubsubService.publish).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a product successfully', async () => {
      // Arrange
      traceIdService.getTraceId.mockReturnValue('test-trace-id');
      productRepository.findById.mockResolvedValue(mockProduct);
      productRepository.delete.mockResolvedValue();
      responseBuilder.generateHATEOASLinks.mockReturnValue({ self: '/api/products' });
      responseBuilder.buildSuccessResponse.mockReturnValue({
        ...mockApiResponse,
        data: null,
      } as any);
      pubsubService.publish.mockResolvedValue();

      // Act
      const result = await service.remove(1, '/api/products');

      // Assert
      expect(productRepository.findById).toHaveBeenCalledWith(1);
      expect(productRepository.delete).toHaveBeenCalledWith(1);
      expect(pubsubService.publish).toHaveBeenCalledWith('productDeleted', { id: 1 });
      expect(result.data).toBeNull();
    });

    it('should throw NotFoundException when product not found', async () => {
      // Arrange
      traceIdService.getTraceId.mockReturnValue('test-trace-id');
      productRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(1, '/api/products')).rejects.toThrow(NotFoundException);
      expect(pubsubService.publish).not.toHaveBeenCalled();
    });
  });

  describe('search', () => {
    it('should search products successfully', async () => {
      // Arrange
      traceIdService.getTraceId.mockReturnValue('test-trace-id');
      productRepository.search.mockResolvedValue([mockProduct]);
      responseBuilder.generateHATEOASLinks.mockReturnValue({ self: '/api/products' });
      responseBuilder.buildSuccessResponse.mockReturnValue({
        ...mockApiResponse,
        data: [mockProduct],
      } as any);

      // Act
      const result = await service.search('test', ['name'], '/api/products');

      // Assert
      expect(productRepository.search).toHaveBeenCalledWith('test', ['name']);
      expect(result.data).toEqual([mockProduct]);
    });

    it('should throw ValidationException for empty query', async () => {
      // Act & Assert
      await expect(service.search('', ['name'], '/api/products')).rejects.toThrow(ValidationException);
      await expect(service.search('   ', ['name'], '/api/products')).rejects.toThrow(ValidationException);
    });
  });

  describe('subscription methods', () => {
    it('should return async iterator for productCreated subscription', () => {
      // Arrange
      const mockIterator = {} as AsyncIterator<any>;
      pubsubService.asyncIterator.mockReturnValue(mockIterator);

      // Act
      const result = service.subscribeToProductCreated();

      // Assert
      expect(pubsubService.asyncIterator).toHaveBeenCalledWith('productCreated');
      expect(result).toBe(mockIterator);
    });

    it('should return async iterator for productUpdated subscription', () => {
      // Arrange
      const mockIterator = {} as AsyncIterator<any>;
      pubsubService.asyncIterator.mockReturnValue(mockIterator);

      // Act
      const result = service.subscribeToProductUpdated();

      // Assert
      expect(pubsubService.asyncIterator).toHaveBeenCalledWith('productUpdated');
      expect(result).toBe(mockIterator);
    });

    it('should return async iterator for productDeleted subscription', () => {
      // Arrange
      const mockIterator = {} as AsyncIterator<any>;
      pubsubService.asyncIterator.mockReturnValue(mockIterator);

      // Act
      const result = service.subscribeToProductDeleted();

      // Assert
      expect(pubsubService.asyncIterator).toHaveBeenCalledWith('productDeleted');
      expect(result).toBe(mockIterator);
    });
  });

  describe('validation methods', () => {
    it('should validate create product DTO correctly', async () => {
      // Test valid DTO - should not throw
      const validDto: CreateProductServiceDto = {
        name: 'Valid Product',
        description: 'Valid description',
        price: 99.99,
        category: 'Electronics',
      };

      traceIdService.getTraceId.mockReturnValue('test-trace-id');
      productRepository.search.mockResolvedValue([]);
      productRepository.create.mockResolvedValue(mockProduct);
      responseBuilder.generateHATEOASLinks.mockReturnValue({ self: '/api/products/1' });
      responseBuilder.buildSuccessResponse.mockReturnValue(mockApiResponse as any);
      pubsubService.publish.mockResolvedValue();

      await expect(service.create(validDto, '/api/products')).resolves.toBeDefined();
    });

    it('should validate update product DTO correctly', async () => {
      // Test valid DTO - should not throw
      const validDto: UpdateProductServiceDto = {
        name: 'Updated Product',
        price: 149.99,
      };

      traceIdService.getTraceId.mockReturnValue('test-trace-id');
      productRepository.findById.mockResolvedValue(mockProduct);
      productRepository.search.mockResolvedValue([]);
      const updatedProduct = { ...mockProduct, name: validDto.name || mockProduct.name, price: validDto.price as any || mockProduct.price };
      productRepository.update.mockResolvedValue(updatedProduct);
      responseBuilder.generateHATEOASLinks.mockReturnValue({ self: '/api/products/1' });
      responseBuilder.buildSuccessResponse.mockReturnValue(mockApiResponse as any);
      pubsubService.publish.mockResolvedValue();

      await expect(service.update(1, validDto, '/api/products')).resolves.toBeDefined();
    });
  });
});