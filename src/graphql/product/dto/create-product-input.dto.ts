import { InputType, OmitType } from '@nestjs/graphql';
import { ProductBaseDTO } from '../../../modules/product/dto/product-base.dto';

/**
 * GraphQL input type for creating a new product
 * Extends ProductBaseDTO and omits auto-generated fields (id, createdAt, updatedAt)
 */
@InputType()
export class CreateProductInput extends OmitType(ProductBaseDTO, ['id', 'createdAt', 'updatedAt'] as const) {}