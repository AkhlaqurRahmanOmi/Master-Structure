import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    HttpCode,
    HttpStatus,
    ParseIntPipe,
    Req,
    UseInterceptors,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse as SwaggerApiResponse,
    ApiParam,
    ApiQuery,
    ApiBody,
    ApiExtraModels,
} from '@nestjs/swagger';
import { Request } from 'express';
import { Product } from '@prisma/client';
import { ProductService } from '../../../modules/product/product.service';
import { CacheInterceptor } from '../../../shared/interceptors/cache.interceptor';
import {
    CreateProductDto,
    UpdateProductDto,
    ProductQueryParamsDTO,
} from './dto';
import { ApiResponse } from '../../../shared/types';
import {
    ProductResponseDto,
    ProductListResponseDto,
    CategoryListResponseDto,
    DeleteResponseDto,
    ApiErrorResponseDto,
} from '../../../shared/dto/swagger-response.dto';

@ApiTags('Products')
@Controller('api/v1/products')
@UseInterceptors(CacheInterceptor)
@ApiExtraModels(ProductResponseDto, ProductListResponseDto, CategoryListResponseDto, DeleteResponseDto, ApiErrorResponseDto)
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    /**
     * Create a new product
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Create a new product',
        description: 'Creates a new product with the provided information',
    })
    @ApiBody({
        type: CreateProductDto,
        description: 'Product data for creation',
    })
    @SwaggerApiResponse({
        status: 201,
        description: 'Product created successfully',
        type: ProductResponseDto,
        schema: {
            example: {
                success: true,
                statusCode: 201,
                message: 'Product created successfully',
                data: {
                    id: 1,
                    name: 'MacBook Pro 16"',
                    description: 'High-performance laptop for professionals',
                    price: 2499.99,
                    category: 'electronics',
                    createdAt: '2025-01-29T10:00:00Z',
                    updatedAt: '2025-01-29T10:00:00Z'
                },
                meta: {
                    timestamp: '2025-01-29T10:30:00Z',
                    traceId: '550e8400-e29b-41d4-a716-446655440000',
                    version: '1.0.0'
                },
                links: {
                    self: '/api/v1/products/1',
                    related: {
                        update: { href: '/api/v1/products/1', method: 'PATCH', rel: 'update' },
                        delete: { href: '/api/v1/products/1', method: 'DELETE', rel: 'delete' }
                    }
                }
            }
        }
    })
    @SwaggerApiResponse({
        status: 400,
        description: 'Invalid input data or validation errors',
        type: ApiErrorResponseDto,
        schema: {
            example: {
                success: false,
                statusCode: 400,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid input data',
                    details: [
                        {
                            field: 'price',
                            message: 'Price must be a positive number',
                            value: -10
                        }
                    ],
                    hint: 'Please check the API documentation for valid input formats'
                },
                meta: {
                    timestamp: '2025-01-29T10:30:00Z',
                    traceId: '550e8400-e29b-41d4-a716-446655440000',
                    version: '1.0.0'
                },
                links: {
                    self: '/api/v1/products',
                    documentation: '/api/docs'
                }
            }
        }
    })
    @SwaggerApiResponse({
        status: 422,
        description: 'Business logic validation failed (e.g., duplicate name)',
        type: ApiErrorResponseDto,
    })
    async create(
        @Body() createProductDto: CreateProductDto,
        @Req() request: Request,
    ): Promise<ApiResponse<Product>> {
        const baseUrl = this.getBaseUrl(request);
        // Convert REST DTO to service DTO
        const serviceDto = {
            name: createProductDto.name,
            description: createProductDto.description,
            price: createProductDto.price,
            category: createProductDto.category,
        };
        return this.productService.create(serviceDto, baseUrl);
    }

    /**
     * Get all products with optional filtering, sorting, and pagination
     */
    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get all products',
        description: 'Retrieves a list of products with optional filtering, sorting, and pagination',
    })
    @ApiQuery({
        name: 'category',
        required: false,
        description: 'Filter by product category',
        example: 'electronics',
    })
    @ApiQuery({
        name: 'minPrice',
        required: false,
        type: Number,
        description: 'Filter by minimum price',
        example: 10.00,
    })
    @ApiQuery({
        name: 'maxPrice',
        required: false,
        type: Number,
        description: 'Filter by maximum price',
        example: 100.00,
    })
    @ApiQuery({
        name: 'search',
        required: false,
        description: 'Search across product name, description, and category',
        example: 'laptop',
    })
    @ApiQuery({
        name: 'name',
        required: false,
        description: 'Filter by exact product name',
        example: 'MacBook Pro',
    })
    @ApiQuery({
        name: 'sortBy',
        required: false,
        enum: ['name', 'price', 'createdAt', 'updatedAt'],
        description: 'Sort by field',
        example: 'name',
    })
    @ApiQuery({
        name: 'sortOrder',
        required: false,
        enum: ['asc', 'desc'],
        description: 'Sort order',
        example: 'asc',
    })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number for pagination',
        example: 1,
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of items per page (max 100)',
        example: 10,
    })
    @ApiQuery({
        name: 'fields',
        required: false,
        description: 'Comma-separated list of fields to include',
        example: 'id,name,price',
    })
    @SwaggerApiResponse({
        status: 200,
        description: 'Products retrieved successfully',
        type: ProductListResponseDto,
        schema: {
            example: {
                success: true,
                statusCode: 200,
                message: 'Products retrieved successfully',
                data: [
                    {
                        id: 1,
                        name: 'MacBook Pro 16"',
                        description: 'High-performance laptop for professionals',
                        price: 2499.99,
                        category: 'electronics',
                        createdAt: '2025-01-29T10:00:00Z',
                        updatedAt: '2025-01-29T10:00:00Z'
                    }
                ],
                meta: {
                    timestamp: '2025-01-29T10:30:00Z',
                    traceId: '550e8400-e29b-41d4-a716-446655440000',
                    version: '1.0.0',
                    pagination: {
                        currentPage: 1,
                        totalPages: 5,
                        totalItems: 50,
                        itemsPerPage: 10,
                        hasNext: true,
                        hasPrev: false
                    }
                },
                links: {
                    self: '/api/v1/products?page=1&limit=10',
                    pagination: {
                        first: '/api/v1/products?page=1&limit=10',
                        next: '/api/v1/products?page=2&limit=10',
                        last: '/api/v1/products?page=5&limit=10'
                    }
                }
            }
        }
    })
    @SwaggerApiResponse({
        status: 400,
        description: 'Invalid query parameters',
        type: ApiErrorResponseDto,
    })
    async findAll(
        @Query() queryParams: ProductQueryParamsDTO,
        @Req() request: Request,
    ): Promise<ApiResponse<Product[]>> {
        const baseUrl = this.getBaseUrl(request);
        // Convert REST DTO to service DTO
        const serviceDto = {
            category: queryParams.category,
            minPrice: queryParams.minPrice,
            maxPrice: queryParams.maxPrice,
            search: queryParams.search,
            name: queryParams.name,
            sortBy: queryParams.sortBy,
            sortOrder: queryParams.sortOrder,
            page: queryParams.page,
            limit: queryParams.limit,
            fields: queryParams.fields,
        };
        return this.productService.findAll(serviceDto, baseUrl);
    }

    /**
     * Get a single product by ID
     */
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get product by ID',
        description: 'Retrieves a single product by its unique identifier',
    })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'Product ID',
        example: 1,
    })
    @SwaggerApiResponse({
        status: 200,
        description: 'Product retrieved successfully',
    })
    @SwaggerApiResponse({
        status: 400,
        description: 'Invalid product ID format',
    })
    @SwaggerApiResponse({
        status: 404,
        description: 'Product not found',
    })
    async findOne(
        @Param('id', ParseIntPipe) id: number,
        @Req() request: Request,
    ): Promise<ApiResponse<Product>> {
        const baseUrl = this.getBaseUrl(request);
        return this.productService.findOne(id, baseUrl);
    }

    /**
     * Update a product by ID
     */
    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Update product by ID',
        description: 'Updates an existing product with the provided information',
    })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'Product ID',
        example: 1,
    })
    @ApiBody({
        type: UpdateProductDto,
        description: 'Product data for update (all fields optional)',
    })
    @SwaggerApiResponse({
        status: 200,
        description: 'Product updated successfully',
    })
    @SwaggerApiResponse({
        status: 400,
        description: 'Invalid input data or product ID format',
    })
    @SwaggerApiResponse({
        status: 404,
        description: 'Product not found',
    })
    @SwaggerApiResponse({
        status: 422,
        description: 'Business logic validation failed (e.g., duplicate name)',
    })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateProductDto: UpdateProductDto,
        @Req() request: Request,
    ): Promise<ApiResponse<Product>> {
        const baseUrl = this.getBaseUrl(request);
        // Convert REST DTO to service DTO
        const serviceDto = {
            name: updateProductDto.name,
            description: updateProductDto.description,
            price: updateProductDto.price,
            category: updateProductDto.category,
        };
        return this.productService.update(id, serviceDto, baseUrl);
    }

    /**
     * Delete a product by ID
     */
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Delete product by ID',
        description: 'Deletes an existing product by its unique identifier',
    })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'Product ID',
        example: 1,
    })
    @SwaggerApiResponse({
        status: 200,
        description: 'Product deleted successfully',
    })
    @SwaggerApiResponse({
        status: 400,
        description: 'Invalid product ID format',
    })
    @SwaggerApiResponse({
        status: 404,
        description: 'Product not found',
    })
    async remove(
        @Param('id', ParseIntPipe) id: number,
        @Req() request: Request,
    ): Promise<ApiResponse<null>> {
        const baseUrl = this.getBaseUrl(request);
        return this.productService.remove(id, baseUrl);
    }

    /**
     * Search products by text query
     */
    @Get('search/:query')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Search products',
        description: 'Search products by text query across name, description, and category fields',
    })
    @ApiParam({
        name: 'query',
        type: String,
        description: 'Search query',
        example: 'laptop',
    })
    @ApiQuery({
        name: 'fields',
        required: false,
        description: 'Comma-separated list of fields to search in',
        example: 'name,description,category',
    })
    @SwaggerApiResponse({
        status: 200,
        description: 'Search completed successfully',
    })
    @SwaggerApiResponse({
        status: 400,
        description: 'Invalid search query',
    })
    async search(
        @Param('query') query: string,
        @Req() request: Request,
        @Query('fields') fields?: string,
    ): Promise<ApiResponse<Product[]>> {
        const baseUrl = this.getBaseUrl(request);
        const searchFields = fields ? fields.split(',').map(f => f.trim()) : ['name', 'description', 'category'];
        return this.productService.search(query, searchFields, baseUrl);
    }

    /**
     * Get products by category
     */
    @Get('category/:category')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get products by category',
        description: 'Retrieves all products belonging to a specific category',
    })
    @ApiParam({
        name: 'category',
        type: String,
        description: 'Product category',
        example: 'electronics',
    })
    @SwaggerApiResponse({
        status: 200,
        description: 'Products retrieved successfully',
    })
    @SwaggerApiResponse({
        status: 400,
        description: 'Invalid category parameter',
    })
    async findByCategory(
        @Param('category') category: string,
        @Req() request: Request,
    ): Promise<ApiResponse<Product[]>> {
        const baseUrl = this.getBaseUrl(request);
        return this.productService.findByCategory(category, baseUrl);
    }

    /**
     * Get products by price range
     */
    @Get('price-range/:minPrice/:maxPrice')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get products by price range',
        description: 'Retrieves all products within the specified price range',
    })
    @ApiParam({
        name: 'minPrice',
        type: Number,
        description: 'Minimum price',
        example: 10.00,
    })
    @ApiParam({
        name: 'maxPrice',
        type: Number,
        description: 'Maximum price',
        example: 100.00,
    })
    @SwaggerApiResponse({
        status: 200,
        description: 'Products retrieved successfully',
    })
    @SwaggerApiResponse({
        status: 400,
        description: 'Invalid price range parameters',
    })
    async findByPriceRange(
        @Param('minPrice', ParseIntPipe) minPrice: number,
        @Param('maxPrice', ParseIntPipe) maxPrice: number,
        @Req() request: Request,
    ): Promise<ApiResponse<Product[]>> {
        const baseUrl = this.getBaseUrl(request);
        return this.productService.findByPriceRange(minPrice, maxPrice, baseUrl);
    }

    /**
     * Get all available categories
     */
    @Get('meta/categories')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get all categories',
        description: 'Retrieves a list of all available product categories',
    })
    @SwaggerApiResponse({
        status: 200,
        description: 'Categories retrieved successfully',
    })
    async getCategories(
        @Req() request: Request,
    ): Promise<ApiResponse<string[]>> {
        const baseUrl = this.getBaseUrl(request);
        return this.productService.getCategories(baseUrl);
    }

    /**
     * Extract base URL from request for HATEOAS link generation
     */
    private getBaseUrl(request: Request): string {
        const protocol = request.protocol;
        const host = request.get('host');

        // For testing environments, normalize the host to remove dynamic ports
        if (process.env.NODE_ENV === 'test' && host?.includes('127.0.0.1:')) {
            return `${protocol}://127.0.0.1`;
        }

        return `${protocol}://${host}`;
    }
}