import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateProductInput } from './create-product-input.dto';

describe('CreateProductInput', () => {
  it('should be defined', () => {
    expect(CreateProductInput).toBeDefined();
  });

  it('should extend ProductBaseDTO for GraphQL input', () => {
    const input = plainToClass(CreateProductInput, {
      name: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      category: 'electronics',
    });

    // The included fields should be present
    expect(input.name).toBe('Test Product');
    expect(input.description).toBe('Test Description');
    expect(input.price).toBe(99.99);
    expect(input.category).toBe('electronics');
  });

  it('should pass validation with valid data', async () => {
    const input = plainToClass(CreateProductInput, {
      name: 'Valid Product Name',
      description: 'Valid product description',
      price: 29.99,
      category: 'electronics',
    });

    const errors = await validate(input);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation with invalid data', async () => {
    const input = plainToClass(CreateProductInput, {
      name: '', // Invalid: empty name
      description: 'A'.repeat(1001), // Invalid: too long description
      price: -10, // Invalid: negative price
      category: 'invalid-category', // Invalid: not in allowed categories
    });

    const errors = await validate(input);
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
    const inputWithInvalidName = plainToClass(CreateProductInput, {
      name: 'A', // Too short
      price: 29.99,
      category: 'electronics',
    });

    const nameErrors = await validate(inputWithInvalidName);
    expect(nameErrors.some(error => error.property === 'name')).toBe(true);

    // Test price validation
    const inputWithInvalidPrice = plainToClass(CreateProductInput, {
      name: 'Valid Product',
      price: 0, // Invalid: zero price
      category: 'electronics',
    });

    const priceErrors = await validate(inputWithInvalidPrice);
    expect(priceErrors.some(error => error.property === 'price')).toBe(true);

    // Test category validation
    const inputWithInvalidCategory = plainToClass(CreateProductInput, {
      name: 'Valid Product',
      price: 29.99,
      category: 'nonexistent', // Invalid category
    });

    const categoryErrors = await validate(inputWithInvalidCategory);
    expect(categoryErrors.some(error => error.property === 'category')).toBe(true);
  });

  it('should handle optional description field', async () => {
    const inputWithoutDescription = plainToClass(CreateProductInput, {
      name: 'Valid Product',
      price: 29.99,
      category: 'electronics',
      // description is optional and not provided
    });

    const errors = await validate(inputWithoutDescription);
    expect(errors).toHaveLength(0);
    expect(inputWithoutDescription.description).toBeUndefined();
  });

  it('should transform and validate data correctly', async () => {
    const input = plainToClass(CreateProductInput, {
      name: '  Valid Product Name  ', // Should be trimmed
      description: '  Valid description  ', // Should be trimmed
      price: '29.99', // Should be converted to number
      category: 'ELECTRONICS', // Should be converted to lowercase
    });

    const errors = await validate(input);
    expect(errors).toHaveLength(0);

    expect(input.name).toBe('Valid Product Name');
    expect(input.description).toBe('Valid description');
    expect(input.price).toBe(29.99);
    expect(typeof input.price).toBe('number');
    expect(input.category).toBe('electronics');
  });

  it('should handle null description correctly', async () => {
    const input = plainToClass(CreateProductInput, {
      name: 'Valid Product',
      description: null,
      price: 29.99,
      category: 'electronics',
    });

    const errors = await validate(input);
    expect(errors).toHaveLength(0);
    expect(input.description).toBeNull();
  });

  it('should validate all required fields are present', async () => {
    const inputMissingFields = plainToClass(CreateProductInput, {
      // Missing name, price, and category
      description: 'Only description provided',
    });

    const errors = await validate(inputMissingFields);
    expect(errors.length).toBeGreaterThan(0);

    const errorProperties = errors.map(error => error.property);
    expect(errorProperties).toContain('name');
    expect(errorProperties).toContain('price');
    expect(errorProperties).toContain('category');
  });

  it('should work with GraphQL schema generation', () => {
    // This test ensures the class is properly configured for GraphQL
    const instance = new CreateProductInput();
    expect(instance).toBeInstanceOf(CreateProductInput);
    
    // Verify that it has the expected properties structure
    const input = plainToClass(CreateProductInput, {
      name: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      category: 'electronics',
    });

    expect(input).toHaveProperty('name');
    expect(input).toHaveProperty('description');
    expect(input).toHaveProperty('price');
    expect(input).toHaveProperty('category');
  });

  it('should handle edge cases for GraphQL input', async () => {
    // Test with minimal valid input
    const minimalInput = plainToClass(CreateProductInput, {
      name: 'Minimal Product',
      price: 0.01, // Minimum valid price
      category: 'other',
    });

    const minimalErrors = await validate(minimalInput);
    expect(minimalErrors).toHaveLength(0);

    // Test with maximum valid input
    const maximalInput = plainToClass(CreateProductInput, {
      name: 'A'.repeat(100), // Maximum valid name length
      description: 'A'.repeat(1000), // Maximum valid description length
      price: 999999.99, // Maximum valid price
      category: 'electronics',
    });

    const maximalErrors = await validate(maximalInput);
    expect(maximalErrors).toHaveLength(0);
  });
});