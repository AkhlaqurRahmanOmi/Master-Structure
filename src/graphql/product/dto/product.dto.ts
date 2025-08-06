import { ObjectType } from '@nestjs/graphql';
import { ProductBaseDTO } from '../../../modules/product/dto/product-base.dto';

/**
 * GraphQL object type for Product responses
 * Extends ProductBaseDTO to inherit all field definitions and validation
 * Used for GraphQL query responses
 */
@ObjectType()
export class ProductDTO extends ProductBaseDTO {}