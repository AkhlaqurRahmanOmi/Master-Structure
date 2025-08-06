/**
 * Service-level DTO for updating a product
 * Used internally by the ProductService
 */
export interface UpdateProductServiceDto {
  name?: string;
  description?: string | null;
  price?: number;
  category?: string;
}