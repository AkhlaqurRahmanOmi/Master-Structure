// Base DTO (shared across all layers)
export * from './product-base.dto';

// Service-level DTOs (used internally by ProductService)
export * from './create-product-service.dto';
export * from './update-product-service.dto';
export * from './product-query-service.dto';

// GraphQL DTOs are now in src/graphql/product/dto/
// REST API DTOs are now in src/api/rest/product/dto/