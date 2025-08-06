import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ProductQueryParamsDTO } from './product-query-params.dto';

describe('ProductQueryParamsDTO', () => {
  it('should be valid with no parameters', async () => {
    const dto = plainToClass(ProductQueryParamsDTO, {});

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should be valid with all valid parameters', async () => {
    const dto = plainToClass(ProductQueryParamsDTO, {
      category: 'electronics',
      minPrice: 10,
      maxPrice: 100,
      search: 'laptop',
      name: 'MacBook',
      sortBy: 'name',
      sortOrder: 'asc',
      page: 1,
      limit: 10,
      fields: 'id,name,price',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation with invalid sortBy', async () => {
    const dto = plainToClass(ProductQueryParamsDTO, {
      sortBy: 'invalid',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isIn');
  });

  it('should fail validation with invalid sortOrder', async () => {
    const dto = plainToClass(ProductQueryParamsDTO, {
      sortOrder: 'invalid',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isIn');
  });

  it('should fail validation with negative prices', async () => {
    const dto = plainToClass(ProductQueryParamsDTO, {
      minPrice: -10,
      maxPrice: -5,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail validation with invalid page/limit', async () => {
    const dto = plainToClass(ProductQueryParamsDTO, {
      page: 0,
      limit: 101,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});