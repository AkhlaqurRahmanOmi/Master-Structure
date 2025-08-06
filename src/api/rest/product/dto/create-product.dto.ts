import { OmitType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { ProductBaseDTO } from '../../../../modules/product/dto/product-base.dto';

/**
 * DTO for creating a new product via REST API
 * Extends ProductBaseDTO and omits auto-generated fields (id, createdAt, updatedAt)
 * 
 * @example
 * {
 *   "name": "MacBook Pro 16\"",
 *   "description": "High-performance laptop for professionals",
 *   "price": 2499.99,
 *   "category": "electronics"
 * }
 */
export class CreateProductDto extends OmitType(ProductBaseDTO, ['id', 'createdAt', 'updatedAt'] as const) {
  @ApiProperty({
    description: 'Product name (2-100 characters). Must contain only letters, numbers, spaces, hyphens, and apostrophes.',
    example: 'MacBook Pro 16"',
    minLength: 2,
    maxLength: 100,
    pattern: '^[a-zA-Z0-9\\s\\-\']+$'
  })
  name: string;

  @ApiProperty({
    description: 'Product description (optional, maximum 1000 characters)',
    example: 'High-performance laptop for professionals with M2 Pro chip, 16GB RAM, and 512GB SSD',
    maxLength: 1000,
    required: false,
    nullable: true
  })
  description?: string | null;

  @ApiProperty({
    description: 'Product price in USD (positive number, maximum 999,999.99)',
    example: 2499.99,
    type: 'number',
    format: 'float',
    minimum: 0.01,
    maximum: 999999.99
  })
  price: number;

  @ApiProperty({
    description: 'Product category',
    example: 'electronics',
    enum: ['electronics', 'clothing', 'books', 'home', 'sports', 'toys', 'beauty', 'automotive', 'food', 'health', 'other']
  })
  category: string;
}