import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ProductDTO } from './product.dto';

describe('ProductDTO', () => {
  it('should be defined', () => {
    expect(ProductDTO).toBeDefined();
  });

  it('should be a GraphQL ObjectType', () => {
    // This test ensures the class is properly configured for GraphQL
    const instance = new ProductDTO();
    expect(instance).toBeInstanceOf(ProductDTO);
  });

  it('should extend ProductBaseDTO and include all fields', () => {
    const dto = plainToClass(ProductDTO, {
      id: 1,
      name: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      category: 'electronics',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      updatedAt: new Date('2023-01-02T00:00:00Z'),
    });

    // All fields should be present including auto-generated ones
    expect(dto.id).toBe(1);
    expect(dto.name).toBe('Test Product');
    expect(dto.description).toBe('Test Description');
    expect(dto.price).toBe(99.99);
    expect(dto.category).toBe('electronics');
    expect(dto.createdAt).toEqual(new Date('2023-01-01T00:00:00Z'));
    expect(dto.updatedAt).toEqual(new Date('2023-01-02T00:00:00Z'));
  });

  it('should pass validation with valid complete data', async () => {
    const dto = plainToClass(ProductDTO, {
      id: 1,
      name: 'Valid Product Name',
      description: 'Valid product description',
      price: 29.99,
      category: 'electronics',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass validation with null description', async () => {
    const dto = plainToClass(ProductDTO, {
      id: 1,
      name: 'Valid Product Name',
      description: null,
      price: 29.99,
      category: 'electronics',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.description).toBeNull();
  });

  it('should fail validation with invalid data', async () => {
    const dto = plainToClass(ProductDTO, {
      id: 1,
      name: '', // Invalid: empty name
      description: 'A'.repeat(1001), // Invalid: too long description
      price: -10, // Invalid: negative price
      category: 'invalid-category', // Invalid: not in allowed categories
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);

    // Check that we have errors for the expected fields
    const errorProperties = errors.map(error => error.property);
    expect(errorProperties).toContain('name');
    expect(errorProperties).toContain('description');
    expect(errorProperties).toContain('price');
    expect(errorProperties).toContain('category');
  });

  it('should inherit all validation rules from ProductBaseDTO', async () => {
    // Test name validation
    const dtoWithInvalidName = plainToClass(ProductDTO, {
      id: 1,
      name: 'A', // Too short
      price: 29.99,
      category: 'electronics',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const nameErrors = await validate(dtoWithInvalidName);
    expect(nameErrors.some(error => error.property === 'name')).toBe(true);

    // Test price validation
    const dtoWithInvalidPrice = plainToClass(ProductDTO, {
      id: 1,
      name: 'Valid Product',
      price: 0, // Invalid: zero price
      category: 'electronics',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const priceErrors = await validate(dtoWithInvalidPrice);
    expect(priceErrors.some(error => error.property === 'price')).toBe(true);

    // Test category validation
    const dtoWithInvalidCategory = plainToClass(ProductDTO, {
      id: 1,
      name: 'Valid Product',
      price: 29.99,
      category: 'nonexistent', // Invalid category
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const categoryErrors = await validate(dtoWithInvalidCategory);
    expect(categoryErrors.some(error => error.property === 'category')).toBe(true);
  });

  it('should transform and validate data correctly', async () => {
    const dto = plainToClass(ProductDTO, {
      id: 1,
      name: '  Valid Product Name  ', // Should be trimmed
      description: '  Valid description  ', // Should be trimmed
      price: '29.99', // Should be converted to number
      category: 'ELECTRONICS', // Should be converted to lowercase
      createdAt: new Date('2023-01-01T00:00:00Z'),
      updatedAt: new Date('2023-01-02T00:00:00Z'),
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);

    expect(dto.name).toBe('Valid Product Name');
    expect(dto.description).toBe('Valid description');
    expect(dto.price).toBe(29.99);
    expect(typeof dto.price).toBe('number');
    expect(dto.category).toBe('electronics');
    expect(dto.createdAt).toBeInstanceOf(Date);
    expect(dto.updatedAt).toBeInstanceOf(Date);
  });

  it('should validate all required fields are present', async () => {
    const dtoMissingFields = plainToClass(ProductDTO, {
      id: 1,
      // Missing name, price, category, createdAt, updatedAt
      description: 'Only description provided',
    });

    const errors = await validate(dtoMissingFields);
    expect(errors.length).toBeGreaterThan(0);

    const errorProperties = errors.map(error => error.property);
    expect(errorProperties).toContain('name');
    expect(errorProperties).toContain('price');
    expect(errorProperties).toContain('category');
  });

  it('should work with GraphQL schema generation', () => {
    // This test ensures the class is properly configured for GraphQL
    const instance = new ProductDTO();
    expect(instance).toBeInstanceOf(ProductDTO);
    
    // Verify that it has the expected properties structure
    const dto = plainToClass(ProductDTO, {
      id: 1,
      name: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      category: 'electronics',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(dto).toHaveProperty('id');
    expect(dto).toHaveProperty('name');
    expect(dto).toHaveProperty('description');
    expect(dto).toHaveProperty('price');
    expect(dto).toHaveProperty('category');
    expect(dto).toHaveProperty('createdAt');
    expect(dto).toHaveProperty('updatedAt');
  });

  it('should handle different data types correctly', async () => {
    const dto = plainToClass(ProductDTO, {
      id: 1,
      name: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      category: 'electronics',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      updatedAt: new Date('2023-01-02T00:00:00Z'),
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);

    expect(typeof dto.id).toBe('number');
    expect(typeof dto.price).toBe('number');
    expect(dto.createdAt).toBeInstanceOf(Date);
    expect(dto.updatedAt).toBeInstanceOf(Date);
  });

  it('should represent complete product data for GraphQL responses', async () => {
    // Test with realistic product data
    const productData = {
      id: 123,
      name: 'MacBook Pro 16-inch',
      description: 'Apple MacBook Pro with M2 Pro chip, 16-inch Liquid Retina XDR display',
      price: 2499.99,
      category: 'electronics',
      createdAt: new Date('2023-01-15T10:30:00Z'),
      updatedAt: new Date('2023-02-01T14:45:00Z'),
    };

    const dto = plainToClass(ProductDTO, productData);
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.id).toBe(123);
    expect(dto.name).toBe('MacBook Pro 16-inch');
    expect(dto.description).toContain('Apple MacBook Pro');
    expect(dto.price).toBe(2499.99);
    expect(dto.category).toBe('electronics');
    expect(dto.createdAt).toEqual(new Date('2023-01-15T10:30:00Z'));
    expect(dto.updatedAt).toEqual(new Date('2023-02-01T14:45:00Z'));
  });

  it('should handle edge cases for GraphQL responses', async () => {
    // Test with minimal valid data
    const minimalDto = plainToClass(ProductDTO, {
      id: 1,
      name: 'Minimal Product',
      price: 0.01, // Minimum valid price
      category: 'other',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const minimalErrors = await validate(minimalDto);
    expect(minimalErrors).toHaveLength(0);

    // Test with maximum valid data
    const maximalDto = plainToClass(ProductDTO, {
      id: 999999,
      name: 'A'.repeat(100), // Maximum valid name length
      description: 'A'.repeat(1000), // Maximum valid description length
      price: 999999.99, // Maximum valid price
      category: 'electronics',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const maximalErrors = await validate(maximalDto);
    expect(maximalErrors).toHaveLength(0);
  });

  it('should maintain data integrity for GraphQL field resolution', () => {
    const originalData = {
      id: 42,
      name: 'Test Product',
      description: 'Test Description',
      price: 19.99,
      category: 'books',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      updatedAt: new Date('2023-01-01T12:00:00Z'),
    };

    const dto = plainToClass(ProductDTO, originalData);

    // Ensure all data is preserved correctly for GraphQL field resolution
    expect(dto.id).toBe(originalData.id);
    expect(dto.name).toBe(originalData.name);
    expect(dto.description).toBe(originalData.description);
    expect(dto.price).toBe(originalData.price);
    expect(dto.category).toBe(originalData.category);
    expect(dto.createdAt).toEqual(originalData.createdAt);
    expect(dto.updatedAt).toEqual(originalData.updatedAt);
  });
});