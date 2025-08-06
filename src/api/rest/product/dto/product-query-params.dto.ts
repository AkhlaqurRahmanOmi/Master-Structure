import { IsOptional, IsString, IsNumber, IsIn, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for product query parameters used in REST API endpoints
 * Supports filtering, sorting, pagination, and field selection
 */
export class ProductQueryParamsDTO {
  // Filtering parameters
  @ApiPropertyOptional({
    description: 'Filter products by category',
    example: 'electronics'
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Filter products by minimum price',
    example: 10.00,
    minimum: 0
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Minimum price must be a valid number' })
  @Min(0, { message: 'Minimum price cannot be negative' })
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Filter products by maximum price',
    example: 100.00,
    minimum: 0
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Maximum price must be a valid number' })
  @Min(0, { message: 'Maximum price cannot be negative' })
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Search products by text across name, description, and category',
    example: 'laptop'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter products by exact name match',
    example: 'MacBook Pro'
  })
  @IsOptional()
  @IsString()
  name?: string;

  // Sorting parameters
  @ApiPropertyOptional({
    description: 'Sort products by field',
    enum: ['name', 'price', 'createdAt', 'updatedAt'],
    example: 'name'
  })
  @IsOptional()
  @IsString()
  @IsIn(['name', 'price', 'createdAt', 'updatedAt'], {
    message: 'Sort field must be one of: name, price, createdAt, updatedAt'
  })
  sortBy?: 'name' | 'price' | 'createdAt' | 'updatedAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    example: 'asc'
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'], {
    message: 'Sort order must be either asc or desc'
  })
  sortOrder?: 'asc' | 'desc';

  // Pagination parameters
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Page must be a valid number' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Limit must be a valid number' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit?: number;

  // Field selection parameter
  @ApiPropertyOptional({
    description: 'Comma-separated list of fields to include in response',
    example: 'id,name,price'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  fields?: string;
}