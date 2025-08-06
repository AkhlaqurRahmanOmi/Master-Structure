import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { Product } from '@prisma/client';
import { ProductRepository } from './product.repository';
import { ResponseBuilderService } from '../../shared/services/response-builder.service';
import { TraceIdService } from '../../shared/services/trace-id.service';
import { ValidationException } from '../../shared/exceptions/validation.exception';
import { PubsubService } from '../../shared/pubsub/pubsub.service';
import { CreateProductServiceDto, UpdateProductServiceDto, ProductQueryServiceDto } from './dto';
import {
  ApiResponse,
  QueryOptions,
  PaginatedResult,
  FilterOptions,
  SortOptions,
  PaginationOptions
} from '../../shared/types';



@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly responseBuilder: ResponseBuilderService,
    private readonly traceIdService: TraceIdService,
    @Inject('PUB_SUB') private readonly pubSub: PubsubService,
  ) { }

  /**
   * Create a new product
   */
  async create(createProductDto: CreateProductServiceDto, baseUrl: string): Promise<ApiResponse<Product>> {
    const traceId = this.traceIdService.getTraceId();

    // Validate input data
    this.validateCreateProductDto(createProductDto);

    try {
      // Check if product with same name already exists
      const existingProducts = await this.productRepository.search(createProductDto.name, ['name']);
      const exactMatch = existingProducts.find(p =>
        p.name.toLowerCase() === createProductDto.name.toLowerCase()
      );

      if (exactMatch) {
        throw ValidationException.forField(
          'name',
          'A product with this name already exists',
          createProductDto.name,
          'unique'
        );
      }

      const product = await this.productRepository.create({
        name: createProductDto.name,
        description: createProductDto.description || null,
        price: createProductDto.price as any, // Handle Decimal type conversion
        category: createProductDto.category,
      });

      // Publish event for GraphQL subscription
      await this.pubSub.publish('productCreated', product);

      const links = this.responseBuilder.generateHATEOASLinks({
        baseUrl,
        resourceId: product.id,
        resourceState: {
          category: product.category,
          price: product.price
        },
        action: 'create'
      });

      return this.responseBuilder.buildSuccessResponse(
        product,
        'Product created successfully',
        201,
        traceId,
        links
      );
    } catch (error) {
      if (error instanceof ValidationException) {
        throw error;
      }
      throw new BadRequestException('Failed to create product');
    }
  }

  /**
   * Get all products with filtering, sorting, and pagination
   */
  async findAll(queryParams: ProductQueryServiceDto, baseUrl: string): Promise<ApiResponse<Product[]>> {
    const traceId = this.traceIdService.getTraceId();

    try {
      const queryOptions = this.buildQueryOptions(queryParams);
      const result: PaginatedResult<Product> = await this.productRepository.findWithFilters(queryOptions);

      const links = this.responseBuilder.generateHATEOASLinks({
        baseUrl,
        currentPage: result.pagination.currentPage,
        totalPages: result.pagination.totalPages,
        hasNext: result.pagination.hasNext,
        hasPrev: result.pagination.hasPrev,
        queryParams: queryParams,
        action: 'list'
      });

      return this.responseBuilder.buildSuccessResponse(
        result.data,
        result.data.length > 0 ? 'Products retrieved successfully' : 'No products found',
        200,
        traceId,
        links,
        result.pagination
      );
    } catch (error) {
      throw new BadRequestException('Failed to retrieve products');
    }
  }

  /**
   * Get a single product by ID
   */
  async findOne(id: number, baseUrl: string): Promise<ApiResponse<Product>> {
    const traceId = this.traceIdService.getTraceId();

    if (!id || id <= 0) {
      throw ValidationException.forField('id', 'Product ID must be a positive number', id, 'positive');
    }

    try {
      const product = await this.productRepository.findById(id);

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      const links = this.responseBuilder.generateHATEOASLinks({
        baseUrl,
        resourceId: product.id,
        resourceState: {
          category: product.category,
          price: product.price
        },
        action: 'get'
      });

      return this.responseBuilder.buildSuccessResponse(
        product,
        'Product retrieved successfully',
        200,
        traceId,
        links
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve product');
    }
  }

  /**
   * Update a product
   */
  async update(id: number, updateProductDto: UpdateProductServiceDto, baseUrl: string): Promise<ApiResponse<Product>> {
    const traceId = this.traceIdService.getTraceId();

    if (!id || id <= 0) {
      throw ValidationException.forField('id', 'Product ID must be a positive number', id, 'positive');
    }

    // Validate input data
    this.validateUpdateProductDto(updateProductDto);

    try {
      // Check if product exists
      const existingProduct = await this.productRepository.findById(id);
      if (!existingProduct) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      // Check for name uniqueness if name is being updated
      if (updateProductDto.name && updateProductDto.name !== existingProduct.name) {
        const existingProducts = await this.productRepository.search(updateProductDto.name, ['name']);
        const exactMatch = existingProducts.find(p =>
          p.name.toLowerCase() === updateProductDto.name!.toLowerCase() && p.id !== id
        );

        if (exactMatch) {
          throw ValidationException.forField(
            'name',
            'A product with this name already exists',
            updateProductDto.name,
            'unique'
          );
        }
      }

      const updateData: any = {};
      if (updateProductDto.name !== undefined) updateData.name = updateProductDto.name;
      if (updateProductDto.description !== undefined) updateData.description = updateProductDto.description;
      if (updateProductDto.price !== undefined) updateData.price = updateProductDto.price as any;
      if (updateProductDto.category !== undefined) updateData.category = updateProductDto.category;

      const updatedProduct = await this.productRepository.update(id, updateData);

      // Publish event for GraphQL subscription
      await this.pubSub.publish('productUpdated', updatedProduct);

      const links = this.responseBuilder.generateHATEOASLinks({
        baseUrl,
        resourceId: updatedProduct.id,
        resourceState: {
          category: updatedProduct.category,
          price: updatedProduct.price
        },
        action: 'update'
      });

      return this.responseBuilder.buildSuccessResponse(
        updatedProduct,
        'Product updated successfully',
        200,
        traceId,
        links
      );
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ValidationException) {
        throw error;
      }
      throw new BadRequestException('Failed to update product');
    }
  }

  /**
   * Delete a product
   */
  async remove(id: number, baseUrl: string): Promise<ApiResponse<null>> {
    const traceId = this.traceIdService.getTraceId();

    if (!id || id <= 0) {
      throw ValidationException.forField('id', 'Product ID must be a positive number', id, 'positive');
    }

    try {
      // Check if product exists
      const existingProduct = await this.productRepository.findById(id);
      if (!existingProduct) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      await this.productRepository.delete(id);

      // Publish event for GraphQL subscription
      await this.pubSub.publish('productDeleted', { id });

      const links = this.responseBuilder.generateHATEOASLinks({
        baseUrl,
        action: 'delete'
      });

      return this.responseBuilder.buildSuccessResponse(
        null,
        'Product deleted successfully',
        200,
        traceId,
        links
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete product');
    }
  }

  /**
   * Search products by text query
   */
  async search(query: string, fields: string[], baseUrl: string): Promise<ApiResponse<Product[]>> {
    const traceId = this.traceIdService.getTraceId();

    if (!query || query.trim().length === 0) {
      throw ValidationException.forField('query', 'Search query cannot be empty', query, 'required');
    }

    if (!fields || fields.length === 0) {
      fields = ['name', 'description', 'category'];
    }

    try {
      const products = await this.productRepository.search(query.trim(), fields);

      const links = this.responseBuilder.generateHATEOASLinks({
        baseUrl,
        action: 'search'
      });

      return this.responseBuilder.buildSuccessResponse(
        products,
        products.length > 0 ? 'Search completed successfully' : 'No products found matching the search criteria',
        200,
        traceId,
        links
      );
    } catch (error) {
      throw new BadRequestException('Failed to search products');
    }
  }

  /**
   * Get products by category
   */
  async findByCategory(category: string, baseUrl: string): Promise<ApiResponse<Product[]>> {
    const traceId = this.traceIdService.getTraceId();

    if (!category || category.trim().length === 0) {
      throw ValidationException.forField('category', 'Category cannot be empty', category, 'required');
    }

    try {
      const products = await this.productRepository.findByCategory(category.trim());

      const links = this.responseBuilder.generateHATEOASLinks({
        baseUrl,
        action: 'filter-by-category'
      });

      return this.responseBuilder.buildSuccessResponse(
        products,
        products.length > 0 ? 'Products retrieved successfully' : 'No products found in this category',
        200,
        traceId,
        links
      );
    } catch (error) {
      throw new BadRequestException('Failed to retrieve products by category');
    }
  }

  /**
   * Get products by price range
   */
  async findByPriceRange(minPrice: number, maxPrice: number, baseUrl: string): Promise<ApiResponse<Product[]>> {
    const traceId = this.traceIdService.getTraceId();

    if (minPrice < 0 || maxPrice < 0) {
      throw ValidationException.forFields([
        { field: 'minPrice', message: 'Minimum price cannot be negative', value: minPrice, constraint: 'min' },
        { field: 'maxPrice', message: 'Maximum price cannot be negative', value: maxPrice, constraint: 'min' }
      ]);
    }

    if (minPrice > maxPrice) {
      throw ValidationException.forField(
        'minPrice',
        'Minimum price cannot be greater than maximum price',
        minPrice,
        'comparison'
      );
    }

    try {
      const products = await this.productRepository.findByPriceRange(minPrice, maxPrice);

      const links = this.responseBuilder.generateHATEOASLinks({
        baseUrl,
        action: 'filter-by-price'
      });

      return this.responseBuilder.buildSuccessResponse(
        products,
        products.length > 0 ? 'Products retrieved successfully' : 'No products found in this price range',
        200,
        traceId,
        links
      );
    } catch (error) {
      throw new BadRequestException('Failed to retrieve products by price range');
    }
  }

  /**
   * Get all available categories
   */
  async getCategories(baseUrl: string): Promise<ApiResponse<string[]>> {
    const traceId = this.traceIdService.getTraceId();

    try {
      const categories = await this.productRepository.getCategories();

      const links = this.responseBuilder.generateHATEOASLinks({
        baseUrl,
        action: 'get-categories'
      });

      return this.responseBuilder.buildSuccessResponse(
        categories,
        'Categories retrieved successfully',
        200,
        traceId,
        links
      );
    } catch (error) {
      throw new BadRequestException('Failed to retrieve categories');
    }
  }

  // Subscription methods for GraphQL resolver
  subscribeToProductCreated() {
    return this.pubSub.asyncIterator('productCreated');
  }

  subscribeToProductUpdated() {
    return this.pubSub.asyncIterator('productUpdated');
  }

  subscribeToProductDeleted() {
    return this.pubSub.asyncIterator('productDeleted');
  }

  /**
   * Build query options from query parameters
   */
  private buildQueryOptions(queryParams: ProductQueryServiceDto): QueryOptions {
    const options: QueryOptions = {};

    // Build filters
    if (queryParams.category || queryParams.minPrice !== undefined ||
      queryParams.maxPrice !== undefined || queryParams.search || queryParams.name) {
      options.filters = {};

      if (queryParams.category) {
        options.filters.category = queryParams.category;
      }

      if (queryParams.minPrice !== undefined) {
        options.filters.minPrice = queryParams.minPrice;
      }

      if (queryParams.maxPrice !== undefined) {
        options.filters.maxPrice = queryParams.maxPrice;
      }

      if (queryParams.search) {
        options.filters.search = queryParams.search;
      }

      if (queryParams.name) {
        options.filters.name = queryParams.name;
      }
    }

    // Build sort options
    if (queryParams.sortBy) {
      options.sort = {
        field: queryParams.sortBy,
        order: queryParams.sortOrder || 'asc'
      };
    }

    // Build pagination options
    options.pagination = {
      page: queryParams.page || 1,
      limit: Math.min(queryParams.limit || 10, 100) // Cap at 100 items per page
    };

    // Field selection
    if (queryParams.fields) {
      options.fields = queryParams.fields.split(',').map(field => field.trim());
    }

    return options;
  }

  /**
   * Validate create product DTO
   */
  private validateCreateProductDto(dto: CreateProductServiceDto): void {
    const errors: Array<{ field: string; message: string; value?: any; constraint?: string }> = [];

    if (!dto.name || dto.name.trim().length === 0) {
      errors.push({ field: 'name', message: 'Product name is required', value: dto.name, constraint: 'required' });
    } else if (dto.name.length > 255) {
      errors.push({ field: 'name', message: 'Product name cannot exceed 255 characters', value: dto.name, constraint: 'maxLength' });
    }

    if (dto.description && dto.description.length > 1000) {
      errors.push({ field: 'description', message: 'Product description cannot exceed 1000 characters', value: dto.description, constraint: 'maxLength' });
    }

    if (dto.price === undefined || dto.price === null) {
      errors.push({ field: 'price', message: 'Product price is required', value: dto.price, constraint: 'required' });
    } else if (dto.price < 0) {
      errors.push({ field: 'price', message: 'Product price cannot be negative', value: dto.price, constraint: 'min' });
    } else if (dto.price > 999999.99) {
      errors.push({ field: 'price', message: 'Product price cannot exceed 999,999.99', value: dto.price, constraint: 'max' });
    }

    if (!dto.category || dto.category.trim().length === 0) {
      errors.push({ field: 'category', message: 'Product category is required', value: dto.category, constraint: 'required' });
    } else if (dto.category.length > 100) {
      errors.push({ field: 'category', message: 'Product category cannot exceed 100 characters', value: dto.category, constraint: 'maxLength' });
    }

    if (errors.length > 0) {
      throw ValidationException.forFields(errors);
    }
  }

  /**
   * Validate update product DTO
   */
  private validateUpdateProductDto(dto: UpdateProductServiceDto): void {
    const errors: Array<{ field: string; message: string; value?: any; constraint?: string }> = [];

    // Check if at least one field is provided
    if (!dto.name && !dto.description && dto.price === undefined && !dto.category) {
      errors.push({ field: 'body', message: 'At least one field must be provided for update', constraint: 'required' });
    }

    if (dto.name !== undefined) {
      if (!dto.name || dto.name.trim().length === 0) {
        errors.push({ field: 'name', message: 'Product name cannot be empty', value: dto.name, constraint: 'required' });
      } else if (dto.name.length > 255) {
        errors.push({ field: 'name', message: 'Product name cannot exceed 255 characters', value: dto.name, constraint: 'maxLength' });
      }
    }

    if (dto.description !== undefined && dto.description !== null && dto.description.length > 1000) {
      errors.push({ field: 'description', message: 'Product description cannot exceed 1000 characters', value: dto.description, constraint: 'maxLength' });
    }

    if (dto.price !== undefined) {
      if (dto.price < 0) {
        errors.push({ field: 'price', message: 'Product price cannot be negative', value: dto.price, constraint: 'min' });
      } else if (dto.price > 999999.99) {
        errors.push({ field: 'price', message: 'Product price cannot exceed 999,999.99', value: dto.price, constraint: 'max' });
      }
    }

    if (dto.category !== undefined) {
      if (!dto.category || dto.category.trim().length === 0) {
        errors.push({ field: 'category', message: 'Product category cannot be empty', value: dto.category, constraint: 'required' });
      } else if (dto.category.length > 100) {
        errors.push({ field: 'category', message: 'Product category cannot exceed 100 characters', value: dto.category, constraint: 'maxLength' });
      }
    }

    if (errors.length > 0) {
      throw ValidationException.forFields(errors);
    }
  }
}