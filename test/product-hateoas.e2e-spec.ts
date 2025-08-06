import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/core/config/prisma/prisma.service';
import { Product } from '@prisma/client';

describe('Product HATEOAS (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let createdProduct: Product;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    // Clean up any existing test data
    await prisma.product.deleteMany({
      where: {
        name: {
          startsWith: 'HATEOAS Test'
        }
      }
    });
  });

  afterAll(async () => {
    // Clean up test data
    if (createdProduct) {
      await prisma.product.delete({
        where: { id: createdProduct.id }
      }).catch(() => {
        // Ignore errors if already deleted
      });
    }

    await prisma.product.deleteMany({
      where: {
        name: {
          startsWith: 'HATEOAS Test'
        }
      }
    });

    await app.close();
  });

  describe('POST /api/v1/products', () => {
    it('should create a product with proper HATEOAS links', async () => {
      const createProductDto = {
        name: 'HATEOAS Test Product',
        description: 'Test product for HATEOAS validation',
        price: 99.99,
        category: 'electronics'
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/products')
        .send(createProductDto)
        .expect(201);

      createdProduct = response.body.data;

      // Verify response structure
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('statusCode', 201);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('links');

      // Verify HATEOAS links
      const links = response.body.links;
      expect(links).toHaveProperty('self');
      expect(links.self).toMatch(/\/api\/v1\/products\/\d+$/);

      expect(links).toHaveProperty('related');
      expect(links.related).toHaveProperty('update');
      expect(links.related).toHaveProperty('delete');
      expect(links.related).toHaveProperty('collection');
      expect(links.related).toHaveProperty('search');
      expect(links.related).toHaveProperty('categories');

      // Verify link structure
      expect(links.related.update).toEqual({
        href: expect.stringMatching(/\/api\/v1\/products\/\d+$/),
        method: 'PATCH',
        rel: 'update'
      });

      expect(links.related.delete).toEqual({
        href: expect.stringMatching(/\/api\/v1\/products\/\d+$/),
        method: 'DELETE',
        rel: 'delete'
      });

      expect(links.related.collection).toEqual({
        href: expect.stringMatching(/\/api\/v1\/products$/),
        method: 'GET',
        rel: 'collection'
      });

      expect(links.related.search).toEqual({
        href: expect.stringMatching(/\/api\/v1\/products\/search\/\{query\}$/),
        method: 'GET',
        rel: 'search',
        type: 'templated'
      });

      expect(links.related.categories).toEqual({
        href: expect.stringMatching(/\/api\/v1\/products\/meta\/categories$/),
        method: 'GET',
        rel: 'categories'
      });
    });
  });

  describe('GET /api/v1/products/:id', () => {
    it('should return a product with proper HATEOAS links', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/products/${createdProduct.id}`)
        .expect(200);

      // Verify HATEOAS links
      const links = response.body.links;
      expect(links).toHaveProperty('self');
      expect(links.self).toBe(`http://127.0.0.1/api/v1/products/${createdProduct.id}`);

      expect(links).toHaveProperty('related');
      expect(links.related).toHaveProperty('update');
      expect(links.related).toHaveProperty('delete');
      expect(links.related).toHaveProperty('collection');
      expect(links.related).toHaveProperty('search');
      expect(links.related).toHaveProperty('categories');
    });
  });

  describe('GET /api/v1/products', () => {
    it('should return products list with proper HATEOAS links', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/products')
        .expect(200);

      // Verify HATEOAS links
      const links = response.body.links;
      expect(links).toHaveProperty('self');
      expect(links.self).toBe('http://127.0.0.1/api/v1/products');

      expect(links).toHaveProperty('related');
      expect(links.related).toHaveProperty('create');
      expect(links.related).toHaveProperty('search');
      expect(links.related).toHaveProperty('categories');
      expect(links.related).toHaveProperty('filter-by-category');
      expect(links.related).toHaveProperty('filter-by-price');

      // Verify link structure for collection
      expect(links.related.create).toEqual({
        href: expect.stringMatching(/\/api\/v1\/products$/),
        method: 'POST',
        rel: 'create'
      });

      expect(links.related['filter-by-category']).toEqual({
        href: expect.stringMatching(/\/api\/v1\/products\/category\/\{category\}$/),
        method: 'GET',
        rel: 'filter-by-category',
        type: 'templated'
      });

      expect(links.related['filter-by-price']).toEqual({
        href: expect.stringMatching(/\/api\/v1\/products\/price-range\/\{minPrice\}\/\{maxPrice\}$/),
        method: 'GET',
        rel: 'filter-by-price',
        type: 'templated'
      });
    });

    it('should return products list with pagination HATEOAS links', async () => {
      // Create multiple test products for pagination
      const testProducts: Product[] = [];
      for (let i = 1; i <= 5; i++) {
        const product = await prisma.product.create({
          data: {
            name: `HATEOAS Test Product ${i}`,
            description: `Test product ${i} for pagination`,
            price: 10.00 + i,
            category: 'test'
          }
        });
        testProducts.push(product);
      }

      try {
        const response = await request(app.getHttpServer())
          .get('/api/v1/products?page=1&limit=3')
          .expect(200);

        // Verify pagination links
        const links = response.body.links;
        expect(links).toHaveProperty('pagination');
        
        if (links.pagination) {
          expect(links.pagination).toHaveProperty('first');
          expect(links.pagination).toHaveProperty('next');
          expect(links.pagination.first).toMatch(/\/api\/v1\/products\?.*page=1/);
          expect(links.pagination.next).toMatch(/\/api\/v1\/products\?.*page=\d+/);
        }

        // Test with filters and pagination
        const filteredResponse = await request(app.getHttpServer())
          .get('/api/v1/products?category=test&page=1&limit=2')
          .expect(200);

        const filteredLinks = filteredResponse.body.links;
        if (filteredLinks.pagination) {
          expect(filteredLinks.pagination.first).toMatch(/category=test.*page=1/);
          expect(filteredLinks.pagination.next).toMatch(/category=test.*page=\d+/);
        }
      } finally {
        // Clean up test products
        await prisma.product.deleteMany({
          where: {
            id: {
              in: testProducts.map(p => p.id)
            }
          }
        });
      }
    });
  });

  describe('PATCH /api/v1/products/:id', () => {
    it('should update a product and return proper HATEOAS links', async () => {
      const updateData = {
        name: 'HATEOAS Test Product Updated',
        price: 149.99
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/products/${createdProduct.id}`)
        .send(updateData)
        .expect(200);

      // Verify HATEOAS links
      const links = response.body.links;
      expect(links).toHaveProperty('self');
      expect(links.self).toBe(`http://127.0.0.1/api/v1/products/${createdProduct.id}`);

      expect(links).toHaveProperty('related');
      expect(links.related).toHaveProperty('update');
      expect(links.related).toHaveProperty('delete');
      expect(links.related).toHaveProperty('collection');
    });
  });

  describe('GET /api/v1/products/search/:query', () => {
    it('should return search results with proper HATEOAS links', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/products/search/HATEOAS')
        .expect(200);

      // Verify HATEOAS links
      const links = response.body.links;
      expect(links).toHaveProperty('self');
      expect(links.self).toBe('http://127.0.0.1/api/v1/products');

      expect(links).toHaveProperty('related');
      expect(links.related).toHaveProperty('create');
      expect(links.related).toHaveProperty('search');
      expect(links.related).toHaveProperty('categories');
    });
  });

  describe('GET /api/v1/products/category/:category', () => {
    it('should return category products with proper HATEOAS links', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/products/category/electronics')
        .expect(200);

      // Verify HATEOAS links
      const links = response.body.links;
      expect(links).toHaveProperty('self');
      expect(links.self).toBe('http://127.0.0.1/api/v1/products');

      expect(links).toHaveProperty('related');
      expect(links.related).toHaveProperty('create');
      expect(links.related).toHaveProperty('search');
      expect(links.related).toHaveProperty('categories');
    });
  });

  describe('GET /api/v1/products/price-range/:minPrice/:maxPrice', () => {
    it('should return price range products with proper HATEOAS links', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/products/price-range/50/200')
        .expect(200);

      // Verify HATEOAS links
      const links = response.body.links;
      expect(links).toHaveProperty('self');
      expect(links.self).toBe('http://127.0.0.1/api/v1/products');

      expect(links).toHaveProperty('related');
      expect(links.related).toHaveProperty('create');
      expect(links.related).toHaveProperty('search');
      expect(links.related).toHaveProperty('categories');
    });
  });

  describe('GET /api/v1/products/meta/categories', () => {
    it('should return categories with proper HATEOAS links', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/products/meta/categories')
        .expect(200);

      // Verify HATEOAS links
      const links = response.body.links;
      expect(links).toHaveProperty('self');
      expect(links.self).toBe('http://127.0.0.1/api/v1/products');

      expect(links).toHaveProperty('related');
      expect(links.related).toHaveProperty('create');
      expect(links.related).toHaveProperty('search');
      expect(links.related).toHaveProperty('categories');
    });
  });

  describe('Link Accessibility', () => {
    it('should have accessible HATEOAS links that return valid responses', async () => {
      // Test that the HATEOAS links actually work
      const productResponse = await request(app.getHttpServer())
        .get(`/api/v1/products/${createdProduct.id}`)
        .expect(200);

      const links = productResponse.body.links;

      // Test collection link
      const collectionPath = new URL(links.related.collection.href).pathname;
      await request(app.getHttpServer())
        .get(collectionPath)
        .expect(200);

      // Test categories link
      const categoriesPath = new URL(links.related.categories.href).pathname;
      await request(app.getHttpServer())
        .get(categoriesPath)
        .expect(200);

      // Test update link (should work with PATCH method)
      const updatePath = new URL(links.related.update.href).pathname;
      await request(app.getHttpServer())
        .patch(updatePath)
        .send({ description: 'Updated via HATEOAS link' })
        .expect(200);
    });
  });
});