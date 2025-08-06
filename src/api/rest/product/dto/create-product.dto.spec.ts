import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateProductDto } from './create-product.dto';

describe('CreateProductDto', () => {
  it('should be defined', () => {
    expect(CreateProductDto).toBeDefined();
  });

  it('should extend ProductBaseDTO and work with validation', () => {
    const dto = plainToClass(CreateProductDto, {
      name: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      category: 'electronics',
    });

    // The included fields should be present
    expect(dto.name).toBe('Test Product');
    expect(dto.description).toBe('Test Description');
    expect(dto.price).toBe(99.99);
    expect(dto.category).toBe('electronics');
  });

  it('should pass validation with valid data', async () => {
    const dto = plainToClass(CreateProductDto, {
      name: 'Valid Product Name',
      description: 'Valid product description',
      price: 29.99,
      category: 'electronics',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation with invalid data', async () => {
    const dto = plainToClass(CreateProductDto, {
      name: '', // Invalid: empty name
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

  it('should inherit all validation rules from ProductBaseDTO', async () => {
    // Test name validation
    const dtoWithInvalidName = plainToClass(CreateProductDto, {
      name: 'A', // Too short
      price: 29.99,
      category: 'electronics',
    });

    const nameErrors = await validate(dtoWithInvalidName);
    expect(nameErrors.some(error => error.property === 'name')).toBe(true);

    // Test price validation
    const dtoWithInvalidPrice = plainToClass(CreateProductDto, {
      name: 'Valid Product',
      price: 0, // Invalid: zero price
      category: 'electronics',
    });

    const priceErrors = await validate(dtoWithInvalidPrice);
    expect(priceErrors.some(error => error.property === 'price')).toBe(true);

    // Test category validation
    const dtoWithInvalidCategory = plainToClass(CreateProductDto, {
      name: 'Valid Product',
      price: 29.99,
      category: 'nonexistent', // Invalid category
    });

    const categoryErrors = await validate(dtoWithInvalidCategory);
    expect(categoryErrors.some(error => error.property === 'category')).toBe(true);
  });

  it('should handle optional description field', async () => {
    const dtoWithoutDescription = plainToClass(CreateProductDto, {
      name: 'Valid Product',
      price: 29.99,
      category: 'electronics',
      // description is optional and not provided
    });

    const errors = await validate(dtoWithoutDescription);
    expect(errors).toHaveLength(0);
    expect(dtoWithoutDescription.description).toBeUndefined();
  });

  it('should transform and validate data correctly', async () => {
    const dto = plainToClass(CreateProductDto, {
      name: '  Valid Product Name  ', // Should be trimmed
      description: '  Valid description  ', // Should be trimmed
      price: '29.99', // Should be converted to number
      category: 'ELECTRONICS', // Should be converted to lowercase
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);

    expect(dto.name).toBe('Valid Product Name');
    expect(dto.description).toBe('Valid description');
    expect(dto.price).toBe(29.99);
    expect(typeof dto.price).toBe('number');
    expect(dto.category).toBe('electronics');
  });

  it('should handle null description correctly', async () => {
    const dto = plainToClass(CreateProductDto, {
      name: 'Valid Product',
      description: null,
      price: 29.99,
      category: 'electronics',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.description).toBeNull();
  });

  it('should validate all required fields are present', async () => {
    const dtoMissingFields = plainToClass(CreateProductDto, {
      // Missing name, price, and category
      description: 'Only description provided',
    });

    const errors = await validate(dtoMissingFields);
    expect(errors.length).toBeGreaterThan(0);

    const errorProperties = errors.map(error => error.property);
    expect(errorProperties).toContain('name');
    expect(errorProperties).toContain('price');
    expect(errorProperties).toContain('category');
  });
});