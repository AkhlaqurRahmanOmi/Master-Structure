/**
 * Service-level DTO for product query parameters
 * Used internally by the ProductService
 */
export interface ProductQueryServiceDto {
  // Filtering parameters
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  name?: string;

  // Sorting parameters
  sortBy?: 'name' | 'price' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';

  // Pagination parameters
  page?: number;
  limit?: number;

  // Field selection parameter
  fields?: string;
}