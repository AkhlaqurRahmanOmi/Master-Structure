import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ProductBaseDTO } from './product-base.dto';

describe('ProductBaseDTO', () => {
  describe('name validation', () => {
    it('should pass with valid name', async () => {
      const dto = plainToClass(ProductBaseDTO, {
        name: 'Valid Product Name',
        price: 99.99,
        category: 'electronics'
      });

      const errors = await validate(dto);
      const nameErrors = errors.filter(error => error.property === 'name');
      expect(nameErrors).toHaveLength(0);
    });

    it('should fail with empty name', async () => {
      const dto = plainToClass(ProductBaseDTO, {
        name: '',
        price: 99.99,
        category: 'electronics'
      });

      const errors = await validate(dto);
      const nameErrors = errors.filter(error => error.property === 'name');
      expect(nameErrors).toHaveLength(1);
      expect(nameErrors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail with name too short', async () => {
      const dto = plainToClass(ProductBaseDTO, {
        name: 'A',
        price: 99.99,
        category: 'electronics'
      });

      const errors = await validate(dto);
      const nameErrors = errors.filter(error => error.property === 'name');
      expect(nameErrors).toHaveLength(1);
      expect(nameErrors[0].constraints).toHaveProperty('isValidProductName');
    });

    it('should fail with name too long', async () => {
      const dto = plainToClass(ProductBaseDTO, {
        name: 'A'.repeat(101),
        price: 99.99,
        category: 'electronics'
      });

      const errors = await validate(dto);
      const nameErrors = errors.filter(error => error.property === 'name');
      expect(nameErrors).toHaveLength(1);
      expect(nameErrors[0].constraints).toHaveProperty('isValidProductName');
    });

    it('should fail with invalid characters in name', async () => {
      const dto = plainToClass(ProductBaseDTO, {
        name: 'Product@Name!',
        price: 99.99,
        category: 'electronics'
      });

      const errors = await validate(dto);
      const nameErrors = errors.filter(error => error.property === 'name');
      expect(nameErrors).toHaveLength(1);
      expect(nameErrors[0].constraints).toHaveProperty('isValidProductName');
    });

    it('should trim whitespace from name', () => {
      const dto = plainToClass(ProductBaseDTO, {
        name: '  Valid Product Name  ',
        price: 99.99,
        category: 'electronics'
      });

      expect(dto.name).toBe('Valid Product Name');
    });
  });

  describe('description validation', () => {
    it('should pass with valid description', async () => {
      const dto = plainToClass(ProductBaseDTO, {
        name: 'Product Name',
        description: 'This is a valid product description.',
        price: 99.99,
        category: 'electronics'
      });

      const errors = await validate(dto);
      const descriptionErrors = errors.filter(error => error.property === 'description');
      expect(descriptionErrors).toHaveLength(0);
    });

    it('should pass with null description', async () => {
      const dto = plainToClass(ProductBaseDTO, {
        name: 'Product Name',
        description: null,
        price: 99.99,
        category: 'electronics'
      });

      const errors = await validate(dto);
      const descriptionErrors = errors.filter(error => error.property === 'description');
      expect(descriptionErrors).toHaveLength(0);
    });

    it('should pass with undefined description', async () => {
      const dto = plainToClass(ProductBaseDTO, {
        name: 'Product Name',
        price: 99.99,
        category: 'electronics'
      });

      const errors = await validate(dto);
      const descriptionErrors = errors.filter(error => error.property === 'description');
      expect(descriptionErrors).toHaveLength(0);
    });

    it('should fail with description too long', async () => {
      const dto = plainToClass(ProductBaseDTO, {
        name: 'Product Name',
        description: 'A'.repeat(1001),
        price: 99.99,
        category: 'electronics'
      });

      const errors = await validate(dto);
      const descriptionErrors = errors.filter(error => error.property === 'description');
      expect(descriptionErrors).toHaveLength(1);
      expect(descriptionErrors[0].constraints).toHaveProperty('isValidDescription');
    });

    it('should convert empty string to null', () => {
      const dto = plainToClass(ProductBaseDTO, {
        name: 'Product Name',
        description: '',
        price: 99.99,
        category: 'electronics'
      });

      expect(dto.description).toBeNull();
    });

    it('should trim whitespace from description', () => {
      const dto = plainToClass(ProductBaseDTO, {
        name: 'Product Name',
        description: '  Valid description  ',
        price: 99.99,
        category: 'electronics'
      });

      expect(dto.description).toBe('Valid description');
    });
  });

  describe('price validation', () => {
    it('should pass with valid price', async () => {
      const dto = plainToClass(ProductBaseDTO, {
        name: 'Product Name',
        price: 99.99,
        category: 'electronics'
      });

      const errors = await validate(dto);
      const priceErrors = errors.filter(error => error.property === 'price');
      expect(priceErrors).toHaveLength(0);
    });

    it('should fail with negative price', async () => {
      const dto = plainToClass(ProductBaseDTO, {
        name: 'Product Name',
        price: -10.00,
        category: 'electronics'
      });

      const errors = await validate(dto);
      const priceErrors = errors.filter(error => error.property === 'price');
      expect(priceErrors).toHaveLength(1);
      expect(priceErrors[0].constraints).toHaveProperty('isPositivePrice');
    });

    it('should fail with zero price', async () => {
      const dto = plainToClass(ProductBaseDTO, {
        name: 'Product Name',
        price: 0,
        category: 'electronics'
      });

      const errors = await validate(dto);
      const priceErrors = errors.filter(error => error.property === 'price');
      expect(priceErrors).toHaveLength(1);
      expect(priceErrors[0].constraints).toHaveProperty('isPositivePrice');
    });

    it('should fail with price too high', async () => {
      const dto = plainToClass(ProductBaseDTO, {
        name: 'Product Name',
        price: 1000000.00,
        category: 'electronics'
      });

      const errors = await validate(dto);
      const priceErrors = errors.filter(error => error.property === 'price');
      expect(priceErrors).toHaveLength(1);
      expect(priceErrors[0].constraints).toHaveProperty('isPositivePrice');
    });

    it('should convert string price to number', () => {
      const dto = plainToClass(ProductBaseDTO, {
        name: 'Product Name',
        price: '99.99',
        category: 'electronics'
      });

      expect(dto.price).toBe(99.99);
      expect(typeof dto.price).toBe('number');
    });

    it('should fail with empty price', async () => {
      const dto = plainToClass(ProductBaseDTO, {
        name: 'Product Name',
        category: 'electronics'
      });

      const errors = await validate(dto);
      const priceErrors = errors.filter(error => error.property === 'price');
      expect(priceErrors).toHaveLength(1);
      expect(priceErrors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });

  describe('category validation', () => {
    const validCategories = [
      'electronics', 'clothing', 'books', 'home', 'sports', 
      'toys', 'beauty', 'automotive', 'food', 'health', 'other'
    ];

    validCategories.forEach(category => {
      it(`should pass with valid category: ${category}`, async () => {
        const dto = plainToClass(ProductBaseDTO, {
          name: 'Product Name',
          price: 99.99,
          category: category
        });

        const errors = await validate(dto);
        const categoryErrors = errors.filter(error => error.property === 'category');
        expect(categoryErrors).toHaveLength(0);
      });
    });

    it('should pass with uppercase category and convert to lowercase', () => {
      const dto = plainToClass(ProductBaseDTO, {
        name: 'Product Name',
        price: 99.99,
        category: 'ELECTRONICS'
      });

      expect(dto.category).toBe('electronics');
    });

    it('should fail with invalid category', async () => {
      const dto = plainToClass(ProductBaseDTO, {
        name: 'Product Name',
        price: 99.99,
        category: 'invalid-category'
      });

      const errors = await validate(dto);
      const categoryErrors = errors.filter(error => error.property === 'category');
      expect(categoryErrors).toHaveLength(1);
      expect(categoryErrors[0].constraints).toHaveProperty('isValidCategory');
    });

    it('should fail with empty category', async () => {
      const dto = plainToClass(ProductBaseDTO, {
        name: 'Product Name',
        price: 99.99,
        category: ''
      });

      const errors = await validate(dto);
      const categoryErrors = errors.filter(error => error.property === 'category');
      expect(categoryErrors).toHaveLength(1);
      expect(categoryErrors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should trim whitespace from category', () => {
      const dto = plainToClass(ProductBaseDTO, {
        name: 'Product Name',
        price: 99.99,
        category: '  electronics  '
      });

      expect(dto.category).toBe('electronics');
    });
  });

  describe('optional fields', () => {
    it('should pass validation with only required fields', async () => {
      const dto = plainToClass(ProductBaseDTO, {
        name: 'Product Name',
        price: 99.99,
        category: 'electronics'
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should handle optional id field', async () => {
      const dto = plainToClass(ProductBaseDTO, {
        id: 1,
        name: 'Product Name',
        price: 99.99,
        category: 'electronics'
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.id).toBe(1);
    });

    it('should handle optional timestamp fields', async () => {
      const now = new Date();
      const dto = plainToClass(ProductBaseDTO, {
        name: 'Product Name',
        price: 99.99,
        category: 'electronics',
        createdAt: now,
        updatedAt: now
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.createdAt).toEqual(now);
      expect(dto.updatedAt).toEqual(now);
    });
  });
});