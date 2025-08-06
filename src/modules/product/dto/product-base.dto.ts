import { IsString, IsOptional, IsInt, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { Field, InputType, ObjectType, Int, Float } from '@nestjs/graphql';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsPositivePrice, 
  IsValidCategory, 
  IsValidProductName, 
  IsValidDescription 
} from '../../../shared/decorators/validation.decorators';

/**
 * Base DTO class containing common product fields with comprehensive validation
 * This class serves as the foundation for both REST and GraphQL DTOs
 * Contains both class-validator decorators and GraphQL field decorators
 */
@InputType('ProductBaseInput')
@ObjectType()
export class ProductBaseDTO {
  @Field(() => Int, { nullable: true, description: 'Unique product identifier' })
  @ApiPropertyOptional({
    description: 'Unique product identifier (auto-generated)',
    example: 1,
    type: 'integer',
    minimum: 1
  })
  @IsOptional()
  @IsInt({ message: 'ID must be an integer' })
  id?: number;

  @Field({ description: 'Product name (2-100 characters)' })
  @ApiProperty({
    description: 'Product name (2-100 characters). Must contain only letters, numbers, spaces, hyphens, and apostrophes.',
    example: 'MacBook Pro 16"',
    minLength: 2,
    maxLength: 100,
    pattern: '^[a-zA-Z0-9\\s\\-\']+$'
  })
  @IsNotEmpty({ message: 'Product name is required' })
  @IsValidProductName({ message: 'Product name must be 2-100 characters long, contain only letters, numbers, spaces, hyphens, and apostrophes, and not have leading/trailing spaces or multiple consecutive spaces' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  name: string;

  @Field(() => String, { nullable: true, description: 'Product description (optional, max 1000 characters)' })
  @ApiPropertyOptional({
    description: 'Product description (optional, maximum 1000 characters)',
    example: 'High-performance laptop for professionals with M2 Pro chip, 16GB RAM, and 512GB SSD',
    maxLength: 1000,
    nullable: true
  })
  @IsOptional()
  @IsValidDescription({ message: 'Description must be a non-empty string with maximum 1000 characters' })
  @Transform(({ value }) => {
    if (value === null || value === undefined || value === '') return null;
    return typeof value === 'string' ? value.trim() : value;
  })
  description?: string | null;

  @Field(() => Float, { description: 'Product price (positive number, max 999,999.99)' })
  @ApiProperty({
    description: 'Product price in USD (positive number, maximum 999,999.99)',
    example: 2499.99,
    type: 'number',
    format: 'float',
    minimum: 0.01,
    maximum: 999999.99
  })
  @IsNotEmpty({ message: 'Product price is required' })
  @IsPositivePrice({ message: 'Price must be a positive number not exceeding 999,999.99' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? value : parsed;
    }
    return value;
  })
  price: number;

  @Field({ description: 'Product category (electronics, clothing, books, home, sports, toys, beauty, automotive, food, health, other)' })
  @ApiProperty({
    description: 'Product category',
    example: 'electronics',
    enum: ['electronics', 'clothing', 'books', 'home', 'sports', 'toys', 'beauty', 'automotive', 'food', 'health', 'other']
  })
  @IsNotEmpty({ message: 'Product category is required' })
  @IsValidCategory({ message: 'Category must be one of: electronics, clothing, books, home, sports, toys, beauty, automotive, food, health, other' })
  @Transform(({ value }) => typeof value === 'string' ? value.toLowerCase().trim() : value)
  category: string;

  @Field({ description: 'Product creation timestamp' })
  @ApiPropertyOptional({
    description: 'Product creation timestamp (auto-generated)',
    example: '2025-01-29T10:00:00Z',
    type: 'string',
    format: 'date-time'
  })
  @IsOptional()
  createdAt?: Date;

  @Field({ description: 'Product last update timestamp' })
  @ApiPropertyOptional({
    description: 'Product last update timestamp (auto-generated)',
    example: '2025-01-29T10:30:00Z',
    type: 'string',
    format: 'date-time'
  })
  @IsOptional()
  updatedAt?: Date;
}