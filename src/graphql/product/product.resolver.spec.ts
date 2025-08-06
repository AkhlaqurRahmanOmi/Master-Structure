import { Test, TestingModule } from '@nestjs/testing';
import { ProductResolver } from './product.resolver';
import { ProductService } from '../../modules/product/product.service';
import { CreateProductInput, UpdateProductInput } from './dto';
import { Product } from '@prisma/client';
import { ApiResponse } from '../../shared/types';

describe('ProductResolver', () => {
  let resolver: ProductResolver;
  let productService: jest.Mocked<ProductService>;
  let mockPubSub: any;

  const mockProduct: Product = {
    id: 1,
    name: 'Test Product',
    description: 'Test Description',
    price: 99.99 as any,
    category: 'electronics',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  };

  const mockApiResponse: ApiResponse<Product> = {
    success: true,
    statusCode: 200,
    message: 'Success',
    data: mockProduct,
    meta: {
      timestamp: '2023-01-01T00:00:00Z',
      traceId: 'test-trace-id',
      version: '1.0.0',
    },
    links: {
      self: '/api/products/1',
    },
  };

  const mockApiResponseArray: ApiResponse<Product[]> = {
    success: true,
    statusCode: 200,
    message: 'Success',
    data: [mockProduct],
    meta: {
      timestamp: '2023-01-01T00:00:00Z',
      traceId: 'test-trace-id',
      version: '1.0.0',
    },
    links: {
      self: '/api/products',
    },
  };

  beforeEach(async () => {
    const mockProductService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      search: jest.fn(),
      findByCategory: jest.fn(),
      findByPriceRange: jest.fn(),
      getCategories: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      subscribeToProductCreated: jest.fn(),
      subscribeToProductUpdated: jest.fn(),
      subscribeToProductDeleted: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductResolver,
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    }).compile();

    resolver = module.get<ProductResolver>(ProductResolver);
    productService = module.get(ProductService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('findAll', () => {
    it('should return array of products', async () => {
      productService.findAll.mockResolvedValue(mockApiResponseArray);

      const result = await resolver.findAll();

      expect(result).toEqual([mockProduct]);
      expect(productService.findAll).toHaveBeenCalledWith(
        {
          category: undefined,
          minPrice: undefined,
          maxPrice: undefined,
          search: undefined,
          sortBy: undefined,
          sortOrder: undefined,
          page: undefined,
          limit: undefined,
        },
        ''
      );
    });

    it('should pass filter parameters to service', async () => {
      productService.findAll.mockResolvedValue(mockApiResponseArray);

      await resolver.findAll('electronics', 10, 100, 'test', 'name', 'asc', 2, 20);

      expect(productService.findAll).toHaveBeenCalledWith(
        {
          category: 'electronics',
          minPrice: 10,
          maxPrice: 100,
          search: 'test',
          sortBy: 'name',
          sortOrder: 'asc',
          page: 2,
          limit: 20,
        },
        ''
      );
    });
  });

  describe('findOne', () => {
    it('should return a single product', async () => {
      productService.findOne.mockResolvedValue(mockApiResponse);

      const result = await resolver.findOne(1);

      expect(result).toEqual(mockProduct);
      expect(productService.findOne).toHaveBeenCalledWith(1, '');
    });
  });

  describe('search', () => {
    it('should return search results', async () => {
      productService.search.mockResolvedValue(mockApiResponseArray);

      const result = await resolver.search('test query');

      expect(result).toEqual([mockProduct]);
      expect(productService.search).toHaveBeenCalledWith(
        'test query',
        ['name', 'description', 'category'],
        ''
      );
    });

    it('should use custom fields when provided', async () => {
      productService.search.mockResolvedValue(mockApiResponseArray);

      await resolver.search('test query', ['name', 'description']);

      expect(productService.search).toHaveBeenCalledWith(
        'test query',
        ['name', 'description'],
        ''
      );
    });
  });

  describe('findByCategory', () => {
    it('should return products by category', async () => {
      productService.findByCategory.mockResolvedValue(mockApiResponseArray);

      const result = await resolver.findByCategory('electronics');

      expect(result).toEqual([mockProduct]);
      expect(productService.findByCategory).toHaveBeenCalledWith('electronics', '');
    });
  });

  describe('findByPriceRange', () => {
    it('should return products by price range', async () => {
      productService.findByPriceRange.mockResolvedValue(mockApiResponseArray);

      const result = await resolver.findByPriceRange(10, 100);

      expect(result).toEqual([mockProduct]);
      expect(productService.findByPriceRange).toHaveBeenCalledWith(10, 100, '');
    });
  });

  describe('getCategories', () => {
    it('should return available categories', async () => {
      const mockCategoriesResponse: ApiResponse<string[]> = {
        ...mockApiResponse,
        data: ['electronics', 'clothing'],
      };
      productService.getCategories.mockResolvedValue(mockCategoriesResponse);

      const result = await resolver.getCategories();

      expect(result).toEqual(['electronics', 'clothing']);
      expect(productService.getCategories).toHaveBeenCalledWith('');
    });
  });

  describe('createProduct', () => {
    it('should create a new product', async () => {
      const createInput: CreateProductInput = {
        name: 'New Product',
        description: 'New Description',
        price: 149.99,
        category: 'electronics',
      };

      productService.create.mockResolvedValue(mockApiResponse);

      const result = await resolver.createProduct(createInput);

      expect(result).toEqual(mockProduct);
      expect(productService.create).toHaveBeenCalledWith(createInput, '');
    });
  });

  describe('updateProduct', () => {
    it('should update an existing product', async () => {
      const updateInput: UpdateProductInput = {
        name: 'Updated Product',
        price: 199.99,
      };

      productService.update.mockResolvedValue(mockApiResponse);

      const result = await resolver.updateProduct(1, updateInput);

      expect(result).toEqual(mockProduct);
      expect(productService.update).toHaveBeenCalledWith(1, updateInput, '');
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product and return true', async () => {
      const mockDeleteResponse: ApiResponse<null> = {
        ...mockApiResponse,
        data: null,
      };
      productService.remove.mockResolvedValue(mockDeleteResponse);

      const result = await resolver.deleteProduct(1);

      expect(result).toBe(true);
      expect(productService.remove).toHaveBeenCalledWith(1, '');
    });
  });

  describe('subscriptions', () => {
    it('should return subscription for product created', () => {
      const mockAsyncIterator = Symbol('asyncIterator');
      productService.subscribeToProductCreated.mockReturnValue(mockAsyncIterator as any);

      const result = resolver.productCreated();

      expect(result).toBe(mockAsyncIterator);
      expect(productService.subscribeToProductCreated).toHaveBeenCalled();
    });

    it('should return subscription for product updated', () => {
      const mockAsyncIterator = Symbol('asyncIterator');
      productService.subscribeToProductUpdated.mockReturnValue(mockAsyncIterator as any);

      const result = resolver.productUpdated();

      expect(result).toBe(mockAsyncIterator);
      expect(productService.subscribeToProductUpdated).toHaveBeenCalled();
    });

    it('should return subscription for product deleted', () => {
      const mockAsyncIterator = Symbol('asyncIterator');
      productService.subscribeToProductDeleted.mockReturnValue(mockAsyncIterator as any);

      const result = resolver.productDeleted();

      expect(result).toBe(mockAsyncIterator);
      expect(productService.subscribeToProductDeleted).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should propagate service errors', async () => {
      const error = new Error('Service error');
      productService.findOne.mockRejectedValue(error);

      await expect(resolver.findOne(1)).rejects.toThrow('Service error');
    });

    it('should propagate validation errors from create', async () => {
      const error = new Error('Validation error');
      productService.create.mockRejectedValue(error);

      const createInput: CreateProductInput = {
        name: 'Test',
        description: 'Test',
        price: 99.99,
        category: 'electronics',
      };

      await expect(resolver.createProduct(createInput)).rejects.toThrow('Validation error');
    });

    it('should propagate validation errors from update', async () => {
      const error = new Error('Validation error');
      productService.update.mockRejectedValue(error);

      const updateInput: UpdateProductInput = {
        name: 'Updated',
      };

      await expect(resolver.updateProduct(1, updateInput)).rejects.toThrow('Validation error');
    });
  });
});