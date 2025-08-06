import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { UpdateProductDto } from './update-product.dto';

describe('UpdateProductDto', () => {
  it('should be defined', () => {
    expect(UpdateProductDto).toBeDefined();
  });

  it('should extend ProductBaseDTO with all fields optional', () => {
    const dto = plainToClass(UpdateProductDto, {
      name: 'Updated Product',
      // Other fields are optional and not provided
    });

    // The included field should be present
    expect(dto.name).toBe('Updated Product');
    
    // Optional fields should be undefined when not provided
    expect(dto.description).toBeUndefined();
    expect(dto.price).toBeUndefined();
    expect(dto.category).toBeUndefined();
  });

  it('should pass validation with partial valid data', async () => {
    const dto = plainToClass(UpdateProductDto, {
      name: 'Updated Product Name',
      // Only updating name, other fields are optional
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass validation with all fields provided', async () => {
    const dto = plainToClass(UpdateProductDto, {
      name: 'Updated Product Name',
      description: 'Updated description',
      price: 49.99,
      category: 'books',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass validation with empty object (all fields optional)', async () => {
    const dto = plainToClass(UpdateProductDto, {});

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation with invalid data when fields are provided', async () => {
    const dto = plainToClass(UpdateProductDto, {
      name: '', // Invalid: empty name when provided
      description: 'A'.repeat(1001), // Invalid: too long description
      price: -10, // Invalid: negative price
      category: 'invalid-category', // Invalid: not in allowed categories
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

  it('should inherit all validation rules from ProductBaseDTO when fields are provided', async () => {
    // Test name validation when provided
    const dtoWithInvalidName = plainToClass(UpdateProductDto, {
      name: 'A', // Too short
    });

    const nameErrors = await validate(dtoWithInvalidName);
    expect(nameErrors.some(error => error.property === 'name')).toBe(true);

    // Test price validation when provided
    const dtoWithInvalidPrice = plainToClass(UpdateProductDto, {
      price: 0, // Invalid: zero price
    });

    const priceErrors = await validate(dtoWithInvalidPrice);
    expect(priceErrors.some(error => error.property === 'price')).toBe(true);

    // Test category validation when provided
    const dtoWithInvalidCategory = plainToClass(UpdateProductDto, {
      category: 'nonexistent', // Invalid category
    });

    const categoryErrors = await validate(dtoWithInvalidCategory);
    expect(categoryErrors.some(error => error.property === 'category')).toBe(true);
  });

  it('should handle individual field updates', async () => {
    // Test updating only name
    const nameOnlyDto = plainToClass(UpdateProductDto, {
      name: 'New Product Name',
    });

    const nameErrors = await validate(nameOnlyDto);
    expect(nameErrors).toHaveLength(0);

    // Test updating only price
    const priceOnlyDto = plainToClass(UpdateProductDto, {
      price: 99.99,
    });

    const priceErrors = await validate(priceOnlyDto);
    expect(priceErrors).toHaveLength(0);

    // Test updating only category
    const categoryOnlyDto = plainToClass(UpdateProductDto, {
      category: 'clothing',
    });

    const categoryErrors = await validate(categoryOnlyDto);
    expect(categoryErrors).toHaveLength(0);

    // Test updating only description
    const descriptionOnlyDto = plainToClass(UpdateProductDto, {
      description: 'New description',
    });

    const descriptionErrors = await validate(descriptionOnlyDto);
    expect(descriptionErrors).toHaveLength(0);
  });

  it('should transform and validate data correctly when provided', async () => {
    const dto = plainToClass(UpdateProductDto, {
      name: '  Updated Product Name  ', // Should be trimmed
      description: '  Updated description  ', // Should be trimmed
      price: '49.99', // Should be converted to number
      category: 'BOOKS', // Should be converted to lowercase
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);

    expect(dto.name).toBe('Updated Product Name');
    expect(dto.description).toBe('Updated description');
    expect(dto.price).toBe(49.99);
    expect(typeof dto.price).toBe('number');
    expect(dto.category).toBe('books');
  });

  it('should handle null values correctly', async () => {
    const dto = plainToClass(UpdateProductDto, {
      name: 'Valid Product',
      description: null, // Explicitly setting to null
      price: 29.99,
      category: 'electronics',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.description).toBeNull();
  });

  it('should handle empty string description correctly', async () => {
    const dto = plainToClass(UpdateProductDto, {
      description: '', // Empty string should be converted to null
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.description).toBeNull();
  });

  it('should validate combinations of fields', async () => {
    // Test valid combination
    const validComboDto = plainToClass(UpdateProductDto, {
      name: 'Updated Product',
      price: 39.99,
    });

    const validErrors = await validate(validComboDto);
    expect(validErrors).toHaveLength(0);

    // Test invalid combination
    const invalidComboDto = plainToClass(UpdateProductDto, {
      name: '', // Invalid name
      price: -10, // Invalid price
    });

    const invalidErrors = await validate(invalidComboDto);
    expect(invalidErrors.length).toBeGreaterThan(0);
    
    const errorProperties = invalidErrors.map(error => error.property);
    expect(errorProperties).toContain('name');
    expect(errorProperties).toContain('price');
  });

  it('should not require any fields (all optional)', async () => {
    const emptyDto = plainToClass(UpdateProductDto, {});
    const nullDto = plainToClass(UpdateProductDto, {
      name: undefined,
      description: undefined,
      price: undefined,
      category: undefined,
    });

    const emptyErrors = await validate(emptyDto);
    const nullErrors = await validate(nullDto);

    expect(emptyErrors).toHaveLength(0);
    expect(nullErrors).toHaveLength(0);
  });
});