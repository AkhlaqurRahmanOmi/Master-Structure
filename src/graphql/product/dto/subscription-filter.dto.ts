import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, IsArray } from 'class-validator';

/**
 * Input type for filtering product subscriptions
 * Allows subscribers to filter events based on specific criteria
 */
@InputType()
export class ProductSubscriptionFilter {
  @Field(() => [String], { nullable: true, description: 'Filter by product categories' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @Field(() => Number, { nullable: true, description: 'Filter by minimum price' })
  @IsOptional()
  minPrice?: number;

  @Field(() => Number, { nullable: true, description: 'Filter by maximum price' })
  @IsOptional()
  maxPrice?: number;

  @Field(() => String, { nullable: true, description: 'Filter by user ID (for authorization)' })
  @IsOptional()
  @IsString()
  userId?: string;
}