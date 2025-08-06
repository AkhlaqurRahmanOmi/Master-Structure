import { Resolver, Query, Mutation, Args, Int, Subscription } from '@nestjs/graphql';
import { ProductService } from '../../modules/product/product.service';
import { ProductDTO, CreateProductInput, UpdateProductInput, ProductSubscriptionFilter } from './dto';
import { Product } from '@prisma/client';
import { ValidationPipe, UsePipes, Scope } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { Inject } from '@nestjs/common';
import { withFilter } from 'graphql-subscriptions';

/**
 * GraphQL resolver for Product operations
 * Handles queries, mutations, and subscriptions for products
 * Does not include REST-specific features like HATEOAS
 * Must be singleton scope for subscriptions to work
 */
@Resolver(() => ProductDTO)
export class ProductResolver {
  constructor(
    private readonly productService: ProductService,
  ) {}

  /**
   * Query to get all products with optional filtering and pagination
   */
  @Query(() => [ProductDTO], { name: 'products', description: 'Get all products with optional filtering' })
  async findAll(
    @Args('category', { type: () => String, nullable: true, description: 'Filter by category' }) category?: string,
    @Args('minPrice', { type: () => Int, nullable: true, description: 'Minimum price filter' }) minPrice?: number,
    @Args('maxPrice', { type: () => Int, nullable: true, description: 'Maximum price filter' }) maxPrice?: number,
    @Args('search', { type: () => String, nullable: true, description: 'Search in name and description' }) search?: string,
    @Args('sortBy', { type: () => String, nullable: true, description: 'Sort by field (name, price, createdAt, updatedAt)' }) sortBy?: 'name' | 'price' | 'createdAt' | 'updatedAt',
    @Args('sortOrder', { type: () => String, nullable: true, description: 'Sort order (asc, desc)' }) sortOrder?: 'asc' | 'desc',
    @Args('page', { type: () => Int, nullable: true, defaultValue: 1, description: 'Page number for pagination' }) page?: number,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10, description: 'Items per page' }) limit?: number,
  ): Promise<Product[]> {
    // Build query parameters for service
    const queryParams = {
      category,
      minPrice,
      maxPrice,
      search,
      sortBy,
      sortOrder,
      page,
      limit,
    };

    // For GraphQL, we don't need the full API response wrapper, just the data
    const response = await this.productService.findAll(queryParams, '');
    return response.data;
  }

  /**
   * Query to get a single product by ID
   */
  @Query(() => ProductDTO, { name: 'product', description: 'Get a product by ID' })
  async findOne(
    @Args('id', { type: () => Int, description: 'Product ID' }) id: number,
  ): Promise<Product> {
    // For GraphQL, we don't need the full API response wrapper, just the data
    const response = await this.productService.findOne(id, '');
    return response.data;
  }

  /**
   * Query to search products by text
   */
  @Query(() => [ProductDTO], { name: 'searchProducts', description: 'Search products by text query' })
  async search(
    @Args('query', { type: () => String, description: 'Search query' }) query: string,
    @Args('fields', { type: () => [String], nullable: true, description: 'Fields to search in' }) fields?: string[],
  ): Promise<Product[]> {
    // For GraphQL, we don't need the full API response wrapper, just the data
    const response = await this.productService.search(query, fields || ['name', 'description', 'category'], '');
    return response.data;
  }

  /**
   * Query to get products by category
   */
  @Query(() => [ProductDTO], { name: 'productsByCategory', description: 'Get products by category' })
  async findByCategory(
    @Args('category', { type: () => String, description: 'Product category' }) category: string,
  ): Promise<Product[]> {
    // For GraphQL, we don't need the full API response wrapper, just the data
    const response = await this.productService.findByCategory(category, '');
    return response.data;
  }

  /**
   * Query to get products by price range
   */
  @Query(() => [ProductDTO], { name: 'productsByPriceRange', description: 'Get products by price range' })
  async findByPriceRange(
    @Args('minPrice', { type: () => Int, description: 'Minimum price' }) minPrice: number,
    @Args('maxPrice', { type: () => Int, description: 'Maximum price' }) maxPrice: number,
  ): Promise<Product[]> {
    // For GraphQL, we don't need the full API response wrapper, just the data
    const response = await this.productService.findByPriceRange(minPrice, maxPrice, '');
    return response.data;
  }

  /**
   * Query to get all available categories
   */
  @Query(() => [String], { name: 'productCategories', description: 'Get all available product categories' })
  async getCategories(): Promise<string[]> {
    // For GraphQL, we don't need the full API response wrapper, just the data
    const response = await this.productService.getCategories('');
    return response.data;
  }

  /**
   * Mutation to create a new product
   */
  @Mutation(() => ProductDTO, { name: 'createProduct', description: 'Create a new product' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createProduct(
    @Args('createProductInput') createProductInput: CreateProductInput,
  ): Promise<Product> {
    // For GraphQL, we don't need the full API response wrapper, just the data
    const response = await this.productService.create(createProductInput, '');
    return response.data;
  }

  /**
   * Mutation to update an existing product
   */
  @Mutation(() => ProductDTO, { name: 'updateProduct', description: 'Update an existing product' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateProduct(
    @Args('id', { type: () => Int, description: 'Product ID' }) id: number,
    @Args('updateProductInput') updateProductInput: UpdateProductInput,
  ): Promise<Product> {
    // For GraphQL, we don't need the full API response wrapper, just the data
    const response = await this.productService.update(id, updateProductInput, '');
    return response.data;
  }

  /**
   * Mutation to delete a product
   */
  @Mutation(() => Boolean, { name: 'deleteProduct', description: 'Delete a product' })
  async deleteProduct(
    @Args('id', { type: () => Int, description: 'Product ID' }) id: number,
  ): Promise<boolean> {
    // For GraphQL, we don't need the full API response wrapper, just success status
    await this.productService.remove(id, '');
    return true;
  }

  /**
   * Subscription for product creation events with optional filtering
   */
  @Subscription(() => ProductDTO, { 
    name: 'productCreated', 
    description: 'Subscribe to product creation events with optional filtering',
    filter: (payload, variables) => {
      const product = payload.productCreated;
      const filter = variables.filter;
      
      if (!filter) return true;
      
      // Filter by categories
      if (filter.categories && filter.categories.length > 0) {
        if (!filter.categories.includes(product.category)) {
          return false;
        }
      }
      
      // Filter by price range
      if (filter.minPrice !== undefined && product.price < filter.minPrice) {
        return false;
      }
      
      if (filter.maxPrice !== undefined && product.price > filter.maxPrice) {
        return false;
      }
      
      return true;
    }
  })
  productCreated(
    @Args('filter', { type: () => ProductSubscriptionFilter, nullable: true, description: 'Optional filter for subscription events' }) 
    filter?: ProductSubscriptionFilter
  ) {
    return this.productService.subscribeToProductCreated();
  }

  /**
   * Subscription for product update events with optional filtering
   */
  @Subscription(() => ProductDTO, { 
    name: 'productUpdated', 
    description: 'Subscribe to product update events with optional filtering',
    filter: (payload, variables) => {
      const product = payload.productUpdated;
      const filter = variables.filter;
      
      if (!filter) return true;
      
      // Filter by categories
      if (filter.categories && filter.categories.length > 0) {
        if (!filter.categories.includes(product.category)) {
          return false;
        }
      }
      
      // Filter by price range
      if (filter.minPrice !== undefined && product.price < filter.minPrice) {
        return false;
      }
      
      if (filter.maxPrice !== undefined && product.price > filter.maxPrice) {
        return false;
      }
      
      return true;
    }
  })
  productUpdated(
    @Args('filter', { type: () => ProductSubscriptionFilter, nullable: true, description: 'Optional filter for subscription events' }) 
    filter?: ProductSubscriptionFilter
  ) {
    return this.productService.subscribeToProductUpdated();
  }

  /**
   * Subscription for product deletion events with optional filtering
   * Note: For deletion events, we only have the product ID, so filtering is limited
   */
  @Subscription(() => ProductDTO, { 
    name: 'productDeleted', 
    description: 'Subscribe to product deletion events',
    filter: (payload, variables) => {
      // For deletion events, we have limited filtering options since the product is deleted
      // We could potentially filter by user authorization here
      const filter = variables.filter;
      
      if (!filter) return true;
      
      // Basic authorization check if userId is provided
      if (filter.userId) {
        // In a real application, you would check if the user has permission to see this deletion
        // For now, we'll allow all authenticated users
        return true;
      }
      
      return true;
    }
  })
  productDeleted(
    @Args('filter', { type: () => ProductSubscriptionFilter, nullable: true, description: 'Optional filter for subscription events' }) 
    filter?: ProductSubscriptionFilter
  ) {
    return this.productService.subscribeToProductDeleted();
  }
}