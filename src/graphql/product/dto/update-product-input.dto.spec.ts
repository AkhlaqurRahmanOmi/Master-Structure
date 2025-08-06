import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { UpdateProductInput } from './update-product-input.dto';

describe('UpdateProductInput', () => {
  it('should be defined', () => {
    expect(UpdateProductInput).toBeDefined();
  });

  it('should extend ProductBaseDTO with all fields optional for GraphQL', () => {
    const input = plainToClass(UpdateProductInput, {
      name: 'Updated Product',
      // Other fields are optional and not provided
    });

    // The included field should be present
    expect(input.name).toBe('Updated Product');
    
    // Optional fields should be undefined when not provided
    expect(input.description).toBeUndefined();
    expect(input.price).toBeUndefined();
    expect(input.category).toBeUndefined();
  });

  it('should pass validation with partial valid data', async () => {
    const input = plainToClass(UpdateProductInput, {
      name: 'Updated Product Name',
      // Only updating name, other fields are optional
    });

    const errors = await validate(input);
    expect(errors).toHaveLength(0);
  });

  it('should pass validation with all fields provided', async () => {
    const input = plainToClass(UpdateProductInput, {
      name: 'Updated Product Name',
      description: 'Updated description',
      price: 49.99,
      category: 'books',
    });

    const errors = await validate(input);
    expect(errors).toHaveLength(0);
  });

  it('should pass validation with empty object (all fields optional)', async () => {
    const input = plainToClass(UpdateProductInput, {});

    const errors = await validate(input);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation with invalid data when fields are provided', async () => {
    const input = plainToClass(UpdateProductInput, {
      name: '', // Invalid: empty name when provided
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

  it('should inherit all validation rules from ProductBaseDTO when fields are provided', async () => {
    // Test name validation when provided
    const inputWithInvalidName = plainToClass(UpdateProductInput, {
      name: 'A', // Too short
    });

    const nameErrors = await validate(inputWithInvalidName);
    expect(nameErrors.some(error => error.property === 'name')).toBe(true);

    // Test price validation when provided
    const inputWithInvalidPrice = plainToClass(UpdateProductInput, {
      price: 0, // Invalid: zero price
    });

    const priceErrors = await validate(inputWithInvalidPrice);
    expect(priceErrors.some(error => error.property === 'price')).toBe(true);

    // Test category validation when provided
    const inputWithInvalidCategory = plainToClass(UpdateProductInput, {
      category: 'nonexistent', // Invalid category
    });

    const categoryErrors = await validate(inputWithInvalidCategory);
    expect(categoryErrors.some(error => error.property === 'category')).toBe(true);
  });

  it('should handle individual field updates', async () => {
    // Test updating only name
    const nameOnlyInput = plainToClass(UpdateProductInput, {
      name: 'New Product Name',
    });

    const nameErrors = await validate(nameOnlyInput);
    expect(nameErrors).toHaveLength(0);

    // Test updating only price
    const priceOnlyInput = plainToClass(UpdateProductInput, {
      price: 99.99,
    });

    const priceErrors = await validate(priceOnlyInput);
    expect(priceErrors).toHaveLength(0);

    // Test updating only category
    const categoryOnlyInput = plainToClass(UpdateProductInput, {
      category: 'clothing',
    });

    const categoryErrors = await validate(categoryOnlyInput);
    expect(categoryErrors).toHaveLength(0);

    // Test updating only description
    const descriptionOnlyInput = plainToClass(UpdateProductInput, {
      description: 'New description',
    });

    const descriptionErrors = await validate(descriptionOnlyInput);
    expect(descriptionErrors).toHaveLength(0);
  });

  it('should transform and validate data correctly when provided', async () => {
    const input = plainToClass(UpdateProductInput, {
      name: '  Updated Product Name  ', // Should be trimmed
      description: '  Updated description  ', // Should be trimmed
      price: '49.99', // Should be converted to number
      category: 'BOOKS', // Should be converted to lowercase
    });

    const errors = await validate(input);
    expect(errors).toHaveLength(0);

    expect(input.name).toBe('Updated Product Name');
    expect(input.description).toBe('Updated description');
    expect(input.price).toBe(49.99);
    expect(typeof input.price).toBe('number');
    expect(input.category).toBe('books');
  });

  it('should handle null values correctly', async () => {
    const input = plainToClass(UpdateProductInput, {
      name: 'Valid Product',
      description: null, // Explicitly setting to null
      price: 29.99,
      category: 'electronics',
    });

    const errors = await validate(input);
    expect(errors).toHaveLength(0);
    expect(input.description).toBeNull();
  });

  it('should handle empty string description correctly', async () => {
    const input = plainToClass(UpdateProductInput, {
      description: '', // Empty string should be converted to null
    });

    const errors = await validate(input);
    expect(errors).toHaveLength(0);
    expect(input.description).toBeNull();
  });

  it('should validate combinations of fields', async () => {
    // Test valid combination
    const validComboInput = plainToClass(UpdateProductInput, {
      name: 'Updated Product',
      price: 39.99,
    });

    const validErrors = await validate(validComboInput);
    expect(validErrors).toHaveLength(0);

    // Test invalid combination
    const invalidComboInput = plainToClass(UpdateProductInput, {
      name: '', // Invalid name
      price: -10, // Invalid price
    });

    const invalidErrors = await validate(invalidComboInput);
    expect(invalidErrors.length).toBeGreaterThan(0);
    
    const errorProperties = invalidErrors.map(error => error.property);
    expect(errorProperties).toContain('name');
    expect(errorProperties).toContain('price');
  });

  it('should not require any fields (all optional)', async () => {
    const emptyInput = plainToClass(UpdateProductInput, {});
    const nullInput = plainToClass(UpdateProductInput, {
      name: undefined,
      description: undefined,
      price: undefined,
      category: undefined,
    });

    const emptyErrors = await validate(emptyInput);
    const nullErrors = await validate(nullInput);

    expect(emptyErrors).toHaveLength(0);
    expect(nullErrors).toHaveLength(0);
  });

  it('should work with GraphQL schema generation', () => {
    // This test ensures the class is properly configured for GraphQL
    const instance = new UpdateProductInput();
    expect(instance).toBeInstanceOf(UpdateProductInput);
    
    // Verify that it has the expected properties structure
    const input = plainToClass(UpdateProductInput, {
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

  it('should handle edge cases for GraphQL input updates', async () => {
    // Test with minimal valid update
    const minimalInput = plainToClass(UpdateProductInput, {
      price: 0.01, // Minimum valid price update
    });

    const minimalErrors = await validate(minimalInput);
    expect(minimalErrors).toHaveLength(0);

    // Test with maximum valid update
    const maximalInput = plainToClass(UpdateProductInput, {
      name: 'A'.repeat(100), // Maximum valid name length
      description: 'A'.repeat(1000), // Maximum valid description length
      price: 999999.99, // Maximum valid price
      category: 'electronics',
    });

    const maximalErrors = await validate(maximalInput);
    expect(maximalErrors).toHaveLength(0);
  });

  it('should support partial updates for GraphQL mutations', async () => {
    // Test various partial update scenarios
    const partialUpdates = [
      { name: 'New Name Only' },
      { price: 123.45 },
      { category: 'sports' },
      { description: 'New description only' },
      { name: 'New Name', price: 67.89 },
      { description: null }, // Explicitly nullifying description
    ];

    for (const update of partialUpdates) {
      const input = plainToClass(UpdateProductInput, update);
      const errors = await validate(input);
      expect(errors).toHaveLength(0);
    }
  });
});