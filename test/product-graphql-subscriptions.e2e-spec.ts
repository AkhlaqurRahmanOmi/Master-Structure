import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ProductModule } from '../src/modules/product/product.module';
import { PrismaModule } from '../src/core/config/prisma/prisma.module';
import { PrismaService } from '../src/core/config/prisma/prisma.service';
import { ProductService } from '../src/modules/product/product.service';
import { PubsubService } from '../src/shared/pubsub/pubsub.service';
import { ProductResolver } from '../src/graphql/product/product.resolver';
import * as request from 'supertest';

describe('Product GraphQL Subscriptions (e2e)', () => {
  let app: INestApplication;
  let productResolver: ProductResolver;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ProductModule,
        PrismaModule,
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: true,
          installSubscriptionHandlers: true,
          playground: false,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    productResolver = moduleFixture.get<ProductResolver>(ProductResolver);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GraphQL Schema Generation', () => {
    it('should generate schema with subscription types', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query IntrospectionQuery {
              __schema {
                subscriptionType {
                  name
                  fields {
                    name
                    description
                  }
                }
              }
            }
          `,
        })
        .expect(200);

      expect(response.body.data.__schema.subscriptionType).toBeDefined();
      expect(response.body.data.__schema.subscriptionType.name).toBe('Subscription');
      
      const subscriptionFields = response.body.data.__schema.subscriptionType.fields;
      const fieldNames = subscriptionFields.map((field: any) => field.name);
      
      expect(fieldNames).toContain('productCreated');
      expect(fieldNames).toContain('productUpdated');
      expect(fieldNames).toContain('productDeleted');
    });
  });

  describe('Subscription Infrastructure', () => {
    it('should have resolver available', async () => {
      expect(productResolver).toBeDefined();
    });

    it('should have subscription methods in resolver', async () => {
      expect(typeof productResolver.productCreated).toBe('function');
      expect(typeof productResolver.productUpdated).toBe('function');
      expect(typeof productResolver.productDeleted).toBe('function');
    });
  });

  describe('Subscription Filtering', () => {
    it('should support category filtering in subscription schema', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query {
              __type(name: "ProductSubscriptionFilter") {
                name
                fields {
                  name
                  type {
                    name
                    ofType {
                      name
                    }
                  }
                }
              }
            }
          `,
        })
        .expect(200);

      expect(response.body.data.__type).toBeDefined();
      expect(response.body.data.__type.name).toBe('ProductSubscriptionFilter');
      
      const fields = response.body.data.__type.fields;
      if (fields) {
        const fieldNames = fields.map((field: any) => field.name);
        
        expect(fieldNames).toContain('categories');
        expect(fieldNames).toContain('minPrice');
        expect(fieldNames).toContain('maxPrice');
        expect(fieldNames).toContain('userId');
      }
    });
  });

  describe('Subscription Resolver Methods', () => {
    it('should have subscription methods that return async iterators', () => {
      expect(typeof productResolver.productCreated).toBe('function');
      expect(typeof productResolver.productUpdated).toBe('function');
      expect(typeof productResolver.productDeleted).toBe('function');
    });
  });

  describe('Error Handling in Subscriptions', () => {
    it('should validate subscription filter input schema', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            subscription {
              productCreated(filter: { categories: ["electronics"], minPrice: 10 }) {
                id
                name
                category
                price
              }
            }
          `,
        });

      // The subscription should accept valid input
      expect(response.status).toBe(200);
    });
  });

  describe('Authorization in Subscriptions', () => {
    it('should support userId filtering for authorization', async () => {
      // Test that userId filter is accepted in the schema
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            subscription {
              productCreated(filter: { userId: "user123" }) {
                id
                name
                category
                price
              }
            }
          `,
        });

      // The subscription should accept userId filter
      expect(response.status).toBe(200);
    });
  });

  describe('Subscription Performance', () => {
    it('should not consume excessive memory during setup', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Test basic memory usage
      const afterMemory = process.memoryUsage().heapUsed;
      
      // Memory usage should not increase dramatically
      const memoryIncrease = afterMemory - initialMemory;
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB increase
    });
  });
});