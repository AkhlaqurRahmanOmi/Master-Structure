import { PartialType, OmitType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProductBaseDTO } from '../../../../modules/product/dto/product-base.dto';

/**
 * DTO for updating an existing product via REST API
 * Extends ProductBaseDTO with all fields optional (partial) except auto-generated ones which are omitted
 * 
 * @example
 * {
 *   "name": "MacBook Pro 16\" (Updated)",
 *   "price": 2399.99
 * }
 */
export class UpdateProductDto extends PartialType(
  OmitType(ProductBaseDTO, ['id', 'createdAt', 'updatedAt'] as const)
) {
  @ApiPropertyOptional({
    description: 'Product name (2-100 characters). Must contain only letters, numbers, spaces, hyphens, and apostrophes.',
    example: 'MacBook Pro 16" (Updated)',
    minLength: 2,
    maxLength: 100,
    pattern: '^[a-zA-Z0-9\\s\\-\']+$'
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'Product description (optional, maximum 1000 characters)',
    example: 'Updated high-performance laptop for professionals with enhanced features',
    maxLength: 1000,
    nullable: true
  })
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Product price in USD (positive number, maximum 999,999.99)',
    example: 2399.99,
    type: 'number',
    format: 'float',
    minimum: 0.01,
    maximum: 999999.99
  })
  price?: number;

  @ApiPropertyOptional({
    description: 'Product category',
    example: 'electronics',
    enum: ['electronics', 'clothing', 'books', 'home', 'sports', 'toys', 'beauty', 'automotive', 'food', 'health', 'other']
  })
  category?: string;
}