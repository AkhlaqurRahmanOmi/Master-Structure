/**
 * Service-level DTO for creating a product
 * Used internally by the ProductService
 */
export interface CreateProductServiceDto {
  name: string;
  description?: string | null;
  price: number;
  category: string;
}