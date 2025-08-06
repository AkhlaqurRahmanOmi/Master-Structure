import { InputType, PartialType, OmitType } from '@nestjs/graphql';
import { ProductBaseDTO } from '../../../modules/product/dto/product-base.dto';

/**
 * GraphQL input type for updating an existing product
 * Extends ProductBaseDTO with all fields optional (partial) except auto-generated ones which are omitted
 */
@InputType()
export class UpdateProductInput extends PartialType(
  OmitType(ProductBaseDTO, ['id', 'createdAt', 'updatedAt'] as const)
) {}